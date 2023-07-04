import Head from 'next/head'
import AdminLayout from "@/components/layouts/Admin";
import Modal from "@/components/Modal";
import 'flowbite';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface Party {
    name: string;
    description: string;
    id: string;
    status: number;
    zipcode: string;
    location: string;
    dateParty: string;
    owner: string;
    players: number;
    time: string;
}

export default function PartyAdmin() {

    const [parties, setParties] = useState([]);
    const [name, setName] = useState("")
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [partySelected, setPartySelected] = useState<Party | undefined>(undefined);
    const [users, setUsers] = useState([]);
    const [owner, setOwner] = useState("");
    const [ownerName, setOwnerName] = useState("");
    const supabase = useSupabaseClient();

    useEffect(() => {
        document.body.classList.add("bg-custom-light-blue");
        getParties();
    }, []);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            document.body.classList.add("bg-custom-light-blue");
            fetch(`${process.env.NEXT_PUBLIC_CLIENT_API}/user/all`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + session?.access_token,
                        },
                        }
            )
                .then(response => response.json())
                .then((data) => {
                    setUsers(data.Users);
                    setOwner(data.Users[0].id);
                }).catch((error) => {
                    console.log(error);
                });
        }
        getUser();
    }, []);

    const getParties = useCallback(async () => {
        await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API}/party`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then((data) => {
                setParties(data.Parties)

            }).catch((error) => {
                console.log(error);

            });
    }, [])

    const update = useCallback(async (e: any) => {

        e.preventDefault();
        const { data: { session } } = await supabase.auth.getSession();

        await fetch(`${process.env.NEXT_PUBLIC_CLIENT_API}/party/admin/update/${partySelected?.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + session?.access_token,
            },
            body: JSON.stringify({
                name: partySelected?.name,
                description: partySelected?.description,
                status: partySelected?.status,
                zipcode: partySelected?.zipcode,
                location: partySelected?.location,
                dateParty: partySelected?.dateParty,
                owner: partySelected?.owner,
                players: partySelected?.players,
                time: partySelected?.time
            })
        })
            .then(response => response.json())
            .then((data) => {

                if (data.statusCode === 200) {
                    setSuccess("Fête modifiée.")
                    setError("")
                    getParties();
                } else {
                    setError(data.response.message)
                    setSuccess("")
                }
                setShowUpdateModal(false);

            }).catch((error) => {
                console.log(error);
            });


    }, [partySelected])


    const openModal = useCallback(async (Party: Party, isUpdate: boolean) => {
        isUpdate ? setShowUpdateModal(true) : setShowDeleteModal(true);
        setPartySelected(Party);
    }, [])


    return (
        <>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <AdminLayout>
                <div className="p-4 sm:ml-64">
                    <div className="p-4 mt-14">


                        {showUpdateModal ? (
                            <>
                                <Modal setShowModal={setShowUpdateModal} title="Modification">
                                    <form onSubmit={update}>
                                        <div className="">
                                            <div>
                                                <label className="block mb-2 text-sm font-medium text-gray-900">Nom</label>
                                                <input type="text"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                    required value={partySelected?.name} onChange={(e) => setPartySelected((prevUser: Party | undefined) => ({ ...prevUser!, name: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div className='mt-4'>
                                            <label htmlFor="description"
                                                className="block mb-2 text-sm font-medium text-gray-900">Description</label>
                                            <textarea name="text" id="text"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                required value={partySelected?.description} onChange={(e) => setPartySelected((prevUser: Party | undefined) => ({ ...prevUser!, description: e.target.value }))} />
                                        </div>
                                        <div className="mt-4">
                                            <div>
                                                <label htmlFor="owner"
                                                    className="block mb-2 text-sm font-medium text-gray-900">Organisateur</label>
                                                <select
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                    required value={partySelected?.owner} onChange={(e) => setPartySelected((prevUser: Party | undefined) => ({ ...prevUser!, owner: e.target.value }))}>
                                                    {users && users.map((user: any, index) => {
                                                        return (
                                                            <option key={index} value={user.id}>{user.email}</option>
                                                        )
                                                    })}

                                                </select>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <div>
                                                <label htmlFor="location"
                                                    className="block mb-2 text-sm font-medium text-gray-900">Localisation</label>
                                                <input type="text" name="localisation" id="localisation"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                    required value={partySelected?.location} onChange={(e) => setPartySelected((prevUser: Party | undefined) => ({ ...prevUser!, location: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <div>
                                                <label htmlFor="zipcode"
                                                    className="block mb-2 text-sm font-medium text-gray-900">Code Postal</label>
                                                <input type="text" name="zipcode" id="zipcode"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                    required value={partySelected?.zipcode} onChange={(e) => setPartySelected((prevUser: Party | undefined) => ({ ...prevUser!, zipcode: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <div>
                                                <label htmlFor="players"
                                                    className="block mb-2 text-sm font-medium text-gray-900">Nombre de joueurs</label>
                                                <input type="number" name="players" id="players"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                    required value={partySelected?.players} onChange={(e) => setPartySelected((prevUser: Party | undefined) => ({ ...prevUser!, players: parseInt(e.target.value) }))} />
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* date */}
                                            <div>
                                                <label htmlFor="date"
                                                    className="block mb-2 text-sm font-medium text-gray-900">Date</label>
                                                <input type="date" name="date" id="date"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                    required value={partySelected?.dateParty} onChange={(e) => setPartySelected((prevUser: Party | undefined) => ({ ...prevUser!, dateParty: e.target.value }))} />
                                            </div>
                                            {/* time */}
                                            <div>
                                                <label htmlFor="time"
                                                    className="block mb-2 text-sm font-medium text-gray-900">Heure</label>
                                                <input type="time" name="time" id="time"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                    required value={partySelected?.time} onChange={(e) => setPartySelected((prevUser: Party | undefined) => ({ ...prevUser!, time: e.target.value }))} />
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <label htmlFor="status"
                                                className="block mb-2 text-sm font-medium text-gray-900">Statut</label>
                                            <select
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                required value={partySelected?.status} onChange={(e) => setPartySelected((prevUser: Party | undefined) => ({ ...prevUser!, status: parseInt(e.target.value) }))}>
                                                <option value="1">Actif</option>
                                                <option value="-1">Désactivé</option>
                                                <option value="0">En attente</option>
                                                value={partySelected?.status}
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-end pt-5 border-t border-solid border-slate-200 rounded-b">
                                            <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Enregistrer</button>
                                        </div>
                                    </form>
                                </Modal>
                            </>
                        ) : null}

                        {
                            success !== "" ?
                                <div id="toast-success" className="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow" role="alert">
                                    <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg">
                                        <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                                        <span className="sr-only">Check icon</span>
                                    </div>
                                    <div className="ml-3 text-sm font-normal">{success}</div>
                                    <button type="button" className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8" data-dismiss-target="#toast-success" aria-label="Close">
                                        <span className="sr-only">Close</span>
                                        <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                                    </button>
                                </div>
                                : ""
                        }

                        <div className="flex justify-end">
                            <Link href={"/admin/party/new"} className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2">Créer une fête</Link>
                        </div>

                        <div className="relative overflow-x-auto mt-5">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr className="border-b">
                                        <th scope="col" className="px-6 py-4">
                                            Nom
                                        </th>
                                        <th scope="col" className="px-6 py-4">
                                            Description
                                        </th>
                                        <th scope="col" className="px-6 py-4">
                                            Localisation
                                        </th>
                                        <th scope="col" className="px-6 py-4">
                                            Nombre de joueurs
                                        </th>
                                        <th scope="col" className="px-6 py-4">
                                            Organisateur
                                        </th>
                                        <th scope="col" className="px-6 py-4">
                                            Date
                                        </th>
                                        <th scope="col" className="px-6 py-4">
                                            Statut
                                        </th>
                                        <th scope="col" className="px-6 py-4">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {parties && parties.length > 0 &&
                                        parties.map((Party: Party, index) => {
                                            return (

                                                <tr key={index} className={index % 2 == 0 ? ' bg-white' : ' bg-gray-50'}>
                                                    <td scope="row" className="px-6 py-3 text-gray-900">
                                                        {Party.name}
                                                    </td>
                                                    <td scope="row" className="px-6 py-3 text-gray-900">
                                                        {Party.description}
                                                    </td>
                                                    <td scope="row" className="px-6 py-3 text-gray-900">
                                                        {Party.location} <br />
                                                        {Party.zipcode}
                                                    </td>
                                                    <td scope="row" className="px-6 py-3 text-gray-900">
                                                        {Party.players}
                                                    </td>
                                                    <td scope="row" className="px-6 py-3 text-gray-900">
                                                        {users && users.map((user: any, index) => {
                                                            if (user.id == Party.owner) {
                                                                return (
                                                                    <div key={index} className="flex-1 min-w-0">
                                                                        <p className="text-sm font-semibold text-gray-900 truncate dark:text-white">
                                                                            {user.firstname} {user.name}
                                                                        </p>
                                                                        <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                                                            {user.email}
                                                                        </p>
                                                                    </div>
                                                                )
                                                            }
                                                        })}
                                                    </td>

                                                    <td scope="row" className="px-6 py-3 text-gray-900">
                                                        <b>{Party.dateParty}</b> <br />
                                                        <b>{Party.time}</b>
                                                    </td>
                                                    <td scope="row" className="px-6 py-3 text-gray-900">
                                                        {(() => {
                                                            if (Party.status == 1) {
                                                                return (
                                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                        Actif
                                                                    </span>
                                                                );
                                                            } else if (Party.status == -1) {
                                                                return (
                                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                                        Désactivé
                                                                    </span>
                                                                );
                                                            }
                                                            return (
                                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                                    Non activé
                                                                </span>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="px-6 py-3 flex">

                                                        <svg onClick={() => openModal(Party, true)} className="w-6 h-6 stroke-blue-500 cursor-pointer" fill="none" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                        </svg>

                                                        {/* <svg onClick={ () => openModal(Party, false)}  fill="none" className="w-6 h-6 stroke-red-500 cursor-pointer" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg> */}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </AdminLayout >
        </>
    )
}


