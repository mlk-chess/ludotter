import {Injectable} from '@nestjs/common';
import {createAnnouncementDto} from './dto/create-announcement.dto';
import {SupabaseService} from './supabase/supabase.service';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import * as path from "path";
import {HttpException} from "@nestjs/common/exceptions/http.exception";
import {HttpStatus} from "@nestjs/common/enums/http-status.enum";

@Injectable()
export class AppService {
  constructor(private supabaseService: SupabaseService) {
  }
  async saveAnnouncement(newAnnouncement: createAnnouncementDto) {
    let pathImages = [];

    for (let i = 0; i < newAnnouncement.selectImages.length; i++) {
      const image = newAnnouncement.selectImages[i];
      let base64Image = image.base64.split(';base64,').pop();

      const fileExtension = path.extname(image.name);
      const uniqueFilename = `${uuidv4()}${fileExtension}`;

      pathImages.push(uniqueFilename);

      fs.writeFile(`./uploads/${uniqueFilename}`, base64Image, { encoding: 'base64' }, function (err) {
        if (err) {
            return new HttpException({message : ["Une erreur est survenue pendant la création de l'annonce"]}, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      });
    }

    const { data, error } =  await this.supabaseService.client
        .from('announcements')
        .insert([{
          name: newAnnouncement.name,
          type: newAnnouncement.type,
          profileId: '72d1498a-3587-429f-8bec-3fafc0cd47bd',
          location: newAnnouncement.city,
          price: newAnnouncement.price,
          description: newAnnouncement.description,
          images: pathImages
        }])
        .select()

      if (error) {
        return new HttpException({message : ["Une erreur est survenue pendant la création de l'annonce"]}, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    for (let i = 0; i < newAnnouncement.selectCategories.length; i++) {
        const { error } =  await this.supabaseService.client
            .from('announcementCategories')
            .insert([{
                announcementId: data[0].id,
                categoryId: newAnnouncement.selectCategories[i]
            }]);

        if (error) {
            console.log(error);
            return new HttpException({message : ["Une erreur est survenue pendant la création de l'annonce"]}, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    return {codeStatus: 201, message: 'Created'};
  }
}
