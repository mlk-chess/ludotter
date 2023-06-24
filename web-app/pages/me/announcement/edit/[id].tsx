import Head from 'next/head'
import React, { useEffect } from "react";
import HomeLayout from "@/components/layouts/Home";
import FormEdit from "@/components/announcement/FormEdit";


export default function New() {
    useEffect(() => {
        document.body.classList.add("bg-custom-light-orange");
    });



    return (
        <>
            <Head>
                <title>Ludotter</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <HomeLayout>
                <section>
                    <FormEdit />
                </section>
            </HomeLayout>
        </>
    )
}