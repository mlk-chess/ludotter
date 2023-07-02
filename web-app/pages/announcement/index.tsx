import Head from 'next/head'
import React, {useEffect, useRef, useState} from "react";
import HomeLayout from "@/components/layouts/Home";
import Link from "next/link";
import Image from "next/image";
import {debounce} from "lodash";

interface Announcement {
    name: string;
    description: string;
    firstImage: string;
    id: string;
    status: number;
    type: string;
    price: number;
}

interface Category {
    id: number;
    name: string;
    createdAt: string;
}

export default function New() {
    const PAGE_COUNT = 12
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [showLoader, setShowLoader] = useState<boolean>(true);
    const [firstLoader, setFirstLoader] = useState<boolean>(true);
    const [maxData, setMaxData] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState(1);
    const [isInView, setIsInView] = useState<boolean>(false);
    const [search, setSearch] = useState<string>('');
    const [result, setResult] = useState<boolean>(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

    useEffect(() => {
        document.body.classList.add("bg-custom-light-orange");
    });

    const handleScroll = () => {
        if (containerRef.current && typeof window !== 'undefined') {
            const container = containerRef.current
            const {bottom} = container.getBoundingClientRect()
            const {innerHeight} = window
            setIsInView((prev) => bottom <= innerHeight)
        }
    }

    useEffect(() => {
        const handleDebouncedScroll = debounce(() => !maxData && handleScroll(), 200)
        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, []);

    useEffect(() => {
        if (isInView && !showLoader) {
            loadMoreTickets(offset)
        }
    }, [isInView])

    const loadMoreTickets = async (offset: number) => {
        const from = offset * PAGE_COUNT;
        const to = from + PAGE_COUNT - 1;

        setOffset((prev) => prev + 1);

        fetch(`${process.env.NEXT_PUBLIC_CLIENT_API}/announcement/all?from=${from}&to=${to}&search=${search}&categories=${selectedCategories}`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then((data) => {
                if (data.length === 0) {
                    setMaxData(true);
                } else {
                    setAnnouncements((prevAnnouncements) => [...prevAnnouncements, ...data])
                }
            }).catch((error) => {
            console.log(error);
        });
    }

    useEffect(() => {
        fecthAnnouncements();
    }, []);

    const fecthAnnouncements = async (value = '') => {
        fetch(`${process.env.NEXT_PUBLIC_CLIENT_API}/announcement/all?from=${0}&to=${PAGE_COUNT - 1}&search=${value}&categories=${selectedCategories}`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then((data) => {
                setFirstLoader(false);
                if (data.length === 0) {
                    setMaxData(true);
                    setAnnouncements([]);
                } else {
                    setResult(true);
                    setAnnouncements(data);
                    if (data.length < PAGE_COUNT) {
                        setMaxData(true);
                    }
                }
                setShowLoader(false);
            }).catch((error) => {
            console.log(error);
        });
    }

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
        fecthAnnouncements(event.target.value);
    }

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_CLIENT_API}/category`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then((data) => {
                setCategories(data)
            }).catch((error) => {
            console.log(error);
        });
    }, []);

    const handleSelectCategory = (id: number) => {
        const index = selectedCategories.indexOf(id);

        if (index === -1) {
            setSelectedCategories([...selectedCategories, id]);
        } else {
            const updatedTableau = [...selectedCategories];
            updatedTableau.splice(index, 1);
            setSelectedCategories(updatedTableau);
        }
    };

    useEffect(() => {
        fecthAnnouncements();
    }, [selectedCategories]);

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
                    <div className="container my-12 mx-auto px-4 md:px-12">
                        {!showLoader &&
                            <div>
                                {
                                    announcements.length === 0 && !result ?
                                        <div className="flex flex-col items-center">
                                            <h2 className="mt-10 text-3xl font-semibold">Il n'y a pas d'annonces
                                                disponibles pour le moment</h2>
                                            <Link href="/me/announcement/new"
                                                  className="mt-10 text-white bg-custom-orange hover:bg-custom-hover-orange focus:outline-none font-medium rounded-lg text-sm md:text-base px-5 py-2.5 text-center">Créer
                                                une annonce</Link>
                                            <Image src="/announcement/cactus.svg" alt="cactus"
                                                   className="w-80 h-80 mt-10"
                                                   width="100" height="100"/>
                                        </div>
                                        :
                                        <div>
                                            <div className="relative">
                                                <div
                                                    className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <svg aria-hidden="true"
                                                         className="w-5 h-5 text-gray-500 dark:text-gray-400"
                                                         fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                         xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth="2"
                                                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                                    </svg>
                                                </div>
                                                <input type="search"
                                                       className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-custom-pastel-purple focus:border-custom-pastel-purple focus:bg-white"
                                                       placeholder="Rechercher" required onChange={handleSearch}/>
                                            </div>

                                            <div className="rounded bg-white p-2 flex mb-10">
                                                {categories.map((item, index) => (
                                                    <div key={index} className={`mx-5 cursor-pointer px-5 py-2 rounded ${selectedCategories.includes(item.id) ? 'bg-custom-pastel-purple hover:bg-custom-pastel-purple': 'hover:bg-[#ffe5fd]'}`} onClick={() => handleSelectCategory(item.id)}>
                                                        <p>{item.name}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {announcements.length === 0 &&
                                                <div className="flex justify-center">
                                                    <h2 className="mt-10 text-3xl font-semibold">Aucun
                                                        résultats</h2>
                                                </div>
                                            }

                                            <div
                                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-y-10"
                                                ref={containerRef}>
                                                {announcements.map((item, index) => (
                                                    <Link href={`/announcement/${encodeURIComponent(item.id)}`}
                                                          key={index}>
                                                        <div
                                                            className="relative w-80 bg-white border border-gray-200 rounded-lg shadow mx-auto hover:-translate-y-3 hover:cursor-pointer hover:scale-105 duration-300">
                                                            <img className="rounded-t-lg h-48 w-full object-cover"
                                                                 src={item.firstImage}
                                                                 alt=""/>
                                                            <div className="flex items-center justify-between p-3">
                                                                {item.type === 'location' ?
                                                                    <>
                                                                    <span
                                                                        className="bg-purple-100 text-purple-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-purple-900 dark:text-purple-300">Location</span>
                                                                        <p className="font-semibold text-gray-700">{item.price} €
                                                                            / jour</p>
                                                                    </>

                                                                    :
                                                                    <>
                                                                    <span
                                                                        className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">En vente</span>
                                                                        <p className="font-semibold text-gray-700">{item.price} €</p>
                                                                    </>
                                                                }

                                                            </div>

                                                            <div className="p-3">
                                                                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{item.name}</h5>

                                                                <p className="mb-3 font-normal text-gray-700">{item.description}</p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                }
                            </div>
                        }
                        {announcements.length > 0 &&
                            <div className="flex justify-center my-10">
                                {!maxData ?

                                    <svg aria-hidden="true"
                                         className="inline w-16 h-16 text-gray-200 animate-spin fill-gray-600 my-10"
                                         viewBox="0 0 100 101" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                            fill="currentColor"/>
                                        <path
                                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                            fill="currentFill"/>
                                    </svg>
                                    :
                                    <h6 className="font-semibold text-lg">Toutes les données ont été chargées</h6>
                                }
                            </div>
                        }
                        {firstLoader &&
                            <div className="flex justify-center my-10">
                                <svg aria-hidden="true"
                                     className="inline w-16 h-16 text-gray-200 animate-spin fill-gray-600 my-10"
                                     viewBox="0 0 100 101" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"/>
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentFill"/>
                                </svg>
                            </div>
                        }
                    </div>
                </section>
            </HomeLayout>
        </>
    )
}