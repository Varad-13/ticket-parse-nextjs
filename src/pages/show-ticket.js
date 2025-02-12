import React, { useEffect, useState } from 'react';
import Head from 'next/head';

export default function ShowTicketPage() {
  const [userId, setUserId] = useState('');
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchTickets = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${apiBaseUrl}/tickets/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setTickets(data.tickets);
      } else {
        setTickets([]);
        alert(data.detail || 'No tickets found');
      }
    } catch (error) {
      alert('Error fetching tickets');
    }
  };

  const openModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  return (
    <>
      <Head>
        <title>Your Mumbai Local Tickets</title>
        <meta name="description" content="View your booked Mumbai local tickets" />
      </Head>

      <main className="bg-gray-100 min-h-screen flex flex-col items-center p-6 text-gray-900">
        <h1 className="text-2xl font-bold mb-4">Enter User ID (Phone Number)</h1>
        <div className="flex space-x-2">
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter your phone number"
            className="border px-4 py-2 rounded-md"
          />
          <button onClick={fetchTickets} className="bg-blue-500 text-white px-4 py-2 rounded-md">Fetch Tickets</button>
        </div>

        {/* Ticket List */}
        {tickets.length > 0 ? (
          <div className="mt-6 w-full max-w-lg bg-white p-4 shadow rounded-lg">
            <h2 className="text-lg font-bold mb-2">Your Tickets</h2>
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => openModal(ticket)}
                className="p-3 border-b cursor-pointer hover:bg-gray-200 transition"
              >
                <p><strong>From:</strong> {ticket.from_station}</p>
                <p><strong>To:</strong> {ticket.to_station}</p>
                <p><strong>Date:</strong> {ticket.journey_date}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-gray-600">No tickets found</p>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && selectedTicket && (
        <div className="fixed inset-0 text-gray-900 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="bg-white p-6 border border-2 border-gray-800 border-dashed rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-4">Ticket Details</h2>
            <div className="space-y-3">
              <p><strong>Phone Number:</strong> {selectedTicket.user_id}</p>
              <p><strong>From:</strong> {selectedTicket.from_station}</p>
              <p><strong>To:</strong> {selectedTicket.to_station}</p>
              <p><strong>Date:</strong> {selectedTicket.journey_date}</p>
              <p><strong>Class:</strong> {selectedTicket.class_value}</p>
              <p><strong>Passenger:</strong> {selectedTicket.adult_child_value}</p>
              <p><strong>Validity:</strong> {selectedTicket.validity}</p>
              <p className="font-bold"><strong>Fare (INR):</strong> Rs. {selectedTicket.fare_value}</p>
              <p className="text-gray-500"><strong>Payment ID:</strong> {selectedTicket.razorpay_order_id}</p>
            </div>
            <button onClick={closeModal} className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
