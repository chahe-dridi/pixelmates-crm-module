import React, { useState,useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BlurContainer from '../components/blurContainer';
import Button from '../components/button';
import { FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from '../config/axios';
import { useAuth } from '../context/authContext';
const ReservationForm = () => {
  const { restaurantId, tableId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [formData, setFormData] = useState({
    reservationDate: '',
    startTime: '',
    partySize: 1,
    specialRequests: ''
  });
  useEffect(() => {  
    const fetchTableDetails = async () => {
      try {
        const response = await axios.get(`/restaurants/${restaurantId}/tables/${tableId}`);
        setRestaurantDetails(response.data);
      } catch (err) {
        toast.error('Error fetching table details');
        navigate('/');
      }
    };
  
    if (restaurantId && tableId) {
      fetchTableDetails();
    }
  }, [restaurantId, tableId, navigate]);
  const calculateEndTime = (dateString, startTime) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date(dateString);
    date.setHours(hours + 2, minutes);
    return date.toISOString().split('T')[1].slice(0, 5); // Format HH:mm
  };
  const handleBackClick = () => navigate(-1);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !(user._id || user.id)) {
      toast.error("User Not Found ");
      console.error("User is null or missing id/_id:", user);
      return;
    }
    const userId = user._id || user.id;
    try {
      const reservationData = {
        user: userId,
        restaurant: restaurantId,
        table: tableId,
        reservationDate: formData.reservationDate,        startTime: formData.startTime,
        endTime: calculateEndTime(formData.reservationDate, formData.startTime),
        partySize: parseInt(formData.partySize),
        specialRequests: formData.specialRequests
      };
      console.log('user:', user);
      console.log('reservationData:', reservationData);
      
      await axios.post('/reservations', reservationData);
  
      toast.success('Your Reservation is confirmed !');
      navigate('/my-reservations');
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || 
                          err.response?.data?.message || 
                          'Error Adding Resvation';
      toast.error(errorMessage);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent relative">
      {/* Blurred background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: "url('/Backg_Login.png')",
          filter: 'blur(5px)',
        }}
      />

      {/* Blurred container */}
      <main className="relative flex-grow flex items-center justify-center py-24 px-6">
        <BlurContainer className="w-full max-w-2xl p-8 sm:p-10 rounded-2xl bg-white/20 backdrop-blur-xl text-white shadow-lg">
          <div className="flex justify-start mb-6">
            <button
              onClick={handleBackClick}
              className="text-white bg-transparent p-2 rounded-full hover:bg-gray-500 transition-all duration-300"
            >
              <FaArrowLeft className="text-2xl" />
            </button>
          </div>

          <h1 className="text-3xl font-bold text-center mb-6">Book a Table</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Date</label>
            <input
              type="date"
              name="reservationDate"
              value={formData.reservationDate}
              onChange={handleChange}
              className="p-3 rounded-lg bg-white/20 border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-[#FA8072]"
              required
            />
          </div>

          <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Start Time</label>
          <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="p-3 rounded-lg bg-white/20 border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-[#FA8072]"
              required
            />
          </div>
        </div>

        <div className="flex flex-col">
        <label className="text-sm font-semibold mb-1">
          Number of guests (max: 6)
         </label>
          <input
            type="number"
            name="partySize"
            min="1"
            max="6"
            value={formData.partySize}
            onChange={handleChange}
            className="p-3 rounded-lg bg-white/20 border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-[#FA8072]"
            required
          />
        </div>

        <div className="flex flex-col">
        <label className="text-sm font-semibold mb-1">Special Requests</label>
        <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            className="p-3 rounded-lg bg-white/20 border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-[#FA8072]"
            rows="3"
            placeholder="Allergies, birthday, etc."
            />
        </div>
            <div className="flex justify-center pt-6 space-x-4">
              <Button
                type="button"
                onClick={handleBackClick}
                className="bg-transparent border border-white text-white hover:bg-white hover:text-black py-2 px-6 rounded-full transition-all duration-300"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="!bg-[#FA8072] hover:!bg-[#e0685a] text-white py-2 px-6 rounded-full transition-all duration-300"
              >
                Confirm Reservation
              </Button>
            </div>
          </form>
        </BlurContainer>
      </main>
    </div>
  );
};

export default ReservationForm;
