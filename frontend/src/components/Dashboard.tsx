import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import DataTable from 'react-data-table-component';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface Ride {
  _id: string;
  pickup_location: Location;
  dropoff_location: Location;
  status: string;
  fare: number;
  payment_method: string;
  payment_status: string;
  requested_at: string;
  is_scheduled: boolean;
  scheduled_time?: string;
}

const Dashboard: React.FC = () => {
  const [recentBookings, setRecentBookings] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentBookings = async () => {
      try {
        const response = await axios.get('/api/recent-bookings');
        setRecentBookings(response.data.rides);
      } catch (err) {
        setError('Failed to fetch recent bookings');
        console.error('Error fetching recent bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const columns = [
    {
      name: 'From',
      selector: (row: Ride) => row.pickup_location.address,
      sortable: true,
      wrap: true,
    },
    {
      name: 'To',
      selector: (row: Ride) => row.dropoff_location.address,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Status',
      selector: (row: Ride) => row.status,
      sortable: true,
      cell: (row: Ride) => (
        <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(row.status)}`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      ),
    },
    {
      name: 'Fare',
      selector: (row: Ride) => row.fare,
      sortable: true,
      cell: (row: Ride) => `₦${row.fare.toLocaleString()}`,
    },
    {
      name: 'Payment',
      selector: (row: Ride) => row.payment_method,
      sortable: true,
    },
    {
      name: 'Requested',
      selector: (row: Ride) => row.requested_at,
      sortable: true,
      cell: (row: Ride) => format(new Date(row.requested_at), 'MMM d, yyyy HH:mm'),
    },
    {
      name: 'Scheduled',
      selector: (row: Ride) => row.scheduled_time,
      sortable: true,
      cell: (row: Ride) => 
        row.is_scheduled && row.scheduled_time 
          ? format(new Date(row.scheduled_time), 'MMM d, yyyy HH:mm')
          : '-',
    },
  ];

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      
      {/* Recent Bookings Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Recent Bookings</h3>
        <DataTable
          columns={columns}
          data={recentBookings}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50]}
          responsive
          striped
          highlightOnHover
          persistTableHead
          noDataComponent="No bookings found"
        />
      </div>
    </div>
  );
};

export default Dashboard; 