import React, { useEffect, useState } from 'react';
import Head from 'next/head';

export default function ShowTicketPage() {
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    // 1) Attempt to read the ticket from localStorage
    const storedTicket = localStorage.getItem('myTicket');
    if (storedTicket) {
      setTicket(JSON.parse(storedTicket));
    }
  }, []);

  // If there's no ticket in localStorage, show a simple message
  if (!ticket) {
    return (
      <main className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-600">
            No ticket found. Please book a ticket first.
          </p>
        </div>
      </main>
    );
  }

  // Otherwise, display the ticket info
  return (
    <>
      <Head>
        <title>Your Mumbai Local Ticket</title>
        <meta name="description" content="Your booked Mumbai local ticket" />
      </Head>

      <main className="bg-gray-100 min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="max-w-md bg-white shadow-md rounded-lg p-6 text-black">
          <h2 className="text-xl font-bold mb-4 text-center">Your Ticket</h2>
          
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Phone Number:</span> {ticket.phoneNumber}
            </p>
            <p>
              <span className="font-semibold">From:</span> {ticket.fromStation}
            </p>
            <p>
              <span className="font-semibold">To:</span> {ticket.toStation}
            </p>
            <p>
              <span className="font-semibold">Journey Date:</span> {ticket.journeyDate}
            </p>
            <p>
              <span className="font-semibold">Class:</span> {ticket.classValue}
            </p>
            <p>
              <span className="font-semibold">Passenger Type:</span> {ticket.adultChildValue}
            </p>
            <p>
              <span className="font-semibold">Ticket Validity:</span> {ticket.validity}
            </p>
            <p>
              <span className="font-semibold">Fare (INR):</span> {ticket.fareValue}
            </p>
            <p>
              <span className="font-semibold">Payment ID:</span> {ticket.paymentId}
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
