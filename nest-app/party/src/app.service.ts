import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { createPartyDto } from './dto/create-party.dto';
import { updatePartyDto } from './dto/update-party.dto';
import { joinPartyDto } from './dto/join-party.dto';
import { SupabaseService } from './supabase/supabase.service';
import { log } from 'console';

@Injectable()
export class AppService {

  constructor(private supabaseService: SupabaseService) { }

  async getParties() {

    const { data: Parties } = await this.supabaseService.client
      .from('party')
      .select('*');

    return Parties;
  }

  async getAllPartipants() {
    const { data: partyProfiles } = await this.supabaseService.client
      .from('partyProfiles')
      .select('*');

    // Get all participants from profiles according to partyProfiles and party
    const { data: profiles } = await this.supabaseService.client
      .from('profiles')
      .select('*')
      .in('id', partyProfiles.map(profile => profile.profileId));

    // Get all parties according to partyProfiles
    const { data: parties } = await this.supabaseService.client
      .from('party')
      .select('*')
      .in('id', partyProfiles.map(profile => profile.partyId));
    

    return {profiles, parties};
  }

  // get all participants from a specific party
  async getParticipants(partyId: string) {
    const { data: partyProfiles } = await this.supabaseService.client
      .from('partyProfiles')
      .select('*')
      .eq('partyId', partyId);
    
    // Get all participants from profiles according to partyProfiles
    const { data: profiles } = await this.supabaseService.client
      .from('profiles')
      .select('*')
      .in('id', partyProfiles.map(profile => profile.profileId));

      //return partyProfiles and profiles
      return {partyProfiles, profiles};
  }

  async saveParty(newParty: createPartyDto) {

    const { data, error } = await this.supabaseService.client
      .from('party')
      .insert([
        {
          name: newParty.name.toLowerCase(),
          description: newParty.description,
          location: newParty.location,
          players: newParty.players,
          owner: newParty.owner,
          time: newParty.time,
          "zipcode": newParty.zipcode,
          "dateParty": newParty.dateParty,
        },
      ]);

    if (error) {
      throw error;
    }

    return { statusCode: 201, message: "Created" }
  }

  async joinParty(joinParty: joinPartyDto) {
    const { data: partyProfiles } = await this.supabaseService.client
      .from('partyProfiles')
      .select('*')
      .eq('partyId', joinParty.partyId);

    const userAlreadyInParty = partyProfiles.some(profile => profile.profileId === joinParty.profileId);

    if (userAlreadyInParty) {
      return new HttpException({ message: ["L'utilisateur est déjà dans la soirée."] }, HttpStatus.BAD_REQUEST);
    }

    const { data, error } = await this.supabaseService.client
      .from('partyProfiles')
      .insert([
        {
          partyId: joinParty.partyId,
          profileId: joinParty.profileId,
        },
      ]);

    if (error) {
      throw error;
    }

    return { statusCode: 201, message: "Created" }
  }


  async getPartyByName(name: string) {
    const { data: party } = await this.supabaseService.client
      .from('party')
      .select('*')
      .eq('name', name);

    return party;
  }

  async getPartyById(id: string) {
    const { data: party } = await this.supabaseService.client
      .from('party')
      .select('*')
      .eq('id', id);

    return party
  }

  

  async updateParty(updateParty: updatePartyDto) {
    const getParty = await this.getPartyById(updateParty.id);

    if (getParty.length == 0) {
      return new HttpException({ message: ["L'évènement n'existe pas."] }, HttpStatus.NOT_FOUND);
    }

    const { data, error } = await this.supabaseService.client
      .from('party')
      .update([
        {
          name: updateParty.name.toLowerCase(),
          description: updateParty.description,
          location: updateParty.location,
          players: updateParty.players,
          owner: updateParty.owner,
          time: updateParty.time,
          "created_at": "2023-06-18T12:34:56Z",
          "zipcode": null,
          "dateParty": null,
        },
      ])
      .eq('id', updateParty.id)

    return { statusCode: 200, message: "Updated" }
  }

  async deleteParty(id: string) {
    const getParty = await this.getPartyById(id);

    if (getParty.length == 0) {
      return new HttpException({ message: ["L'évènement n'existe pas."] }, HttpStatus.NOT_FOUND);
    }

    const { data, error } = await this.supabaseService.client
      .from('party')
      .delete()
      .eq('id', id);

    return { statusCode: 204, message: "Deleted" }
  }

  // Function to leave party
  async leaveParty(dataToLeave : any) {

    const { data: partyProfiles } = await this.supabaseService.client
      .from('partyProfiles')
      .select('*')
      .eq('partyId', dataToLeave.partyId);

      console.log(dataToLeave, dataToLeave,partyProfiles);
    const userAlreadyInParty = partyProfiles.some(profile => profile.profileId === dataToLeave.profileId);

    if (!userAlreadyInParty) {
      return new HttpException({ message: ["L'utilisateur n'est pas dans la soirée."] }, HttpStatus.BAD_REQUEST);
    }

    const { data, error } = await this.supabaseService.client
      .from('partyProfiles')
      .delete()
      .eq('partyId', dataToLeave.partyId)
      .eq('profileId', dataToLeave.profileId);

    return { statusCode: 204, message: "Deleted" }
  }

}
