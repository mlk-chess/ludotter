import Head from 'next/head'
import HomeLayout from '@/components/layouts/Home'
import React, {useEffect, useState} from "react";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import {Button, Modal} from "flowbite-react";
import Datepicker from "react-tailwindcss-datepicker";
import interactionPlugin from "@fullcalendar/interaction"
import {useSupabaseClient} from "@supabase/auth-helpers-react";
import Loader from "@/components/utils/Loader";

interface Error {
    date: string;
    startTime: string;
    endTime: string;
}

interface Visio {
    date: string;
    title: string;
    id: string;
    dateVisio: string;
}

export default function Master() {
    const [visio, setVisio] = useState<Visio[]>([])
    const [isLoad, setIsLoad] = useState<boolean>(true);
    const supabase = useSupabaseClient();

    useEffect(() => {
        document.body.classList.add("bg-custom-light-orange");
        fetchData();
    }, []);

    const fetchData = async () => {
        const {data: {session}} = await supabase.auth.getSession();

        fetch(`${process.env.NEXT_PUBLIC_CLIENT_API}/visio/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + session?.access_token,
            },
        })
            .then(response => response.json())
            .then((data) => {
                setVisio(data);
                setIsLoad(false);
            }).catch((error) => {
            console.log(error);
        });
    }

    function renderEventContent(eventInfo: any) {
        return (
            <div className="flex items-center justify-between">
                <i>{eventInfo.event.title}</i>
            </div>
        )
    }

    return (
        <>
            <Head>
                <title>Ludotter</title>
                <meta name="description" content="Generated by create next app"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <HomeLayout>
                <section>
                    <div className="container">
                        {isLoad ?
                            <Loader/>
                            :
                            <>
                                <h2 className="mt-10 mb-3 ml-5 text-3xl font-semibold text-center">Disponibilités</h2>
                                <div className="w-full flex justify-center">
                                    <div className="w-3/4 mt-10">
                                        <div
                                            className="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                                            <FullCalendar
                                                plugins={[dayGridPlugin, interactionPlugin]}
                                                initialView="dayGridMonth"
                                                firstDay={1}
                                                locale="fr"
                                                headerToolbar={{
                                                    center: 'title',
                                                    left: '',
                                                }}
                                                buttonText={{
                                                    today: 'Aujourd\'hui',
                                                }}
                                                events={visio}
                                                eventContent={renderEventContent}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                </section>
            </HomeLayout>
        </>
    )
}