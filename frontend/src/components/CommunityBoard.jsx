import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter, Globe, TrendingUp, Clock, SortAsc, ArrowLeft } from "lucide-react";
import TripCard from '@/components/TripCard';
import { getPublicTrips } from '@/api/community.api';

const CommunityBoard = () => {
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [error, setError] = useState(null);

    const sortOptions = [
        { value: 'newest', label: 'Newest First', icon: Clock },
        { value: 'oldest', label: 'Oldest First', icon: SortAsc },
        { value: 'popular', label: 'Most Popular', icon: TrendingUp },
    ];

    const fetchTrips = useCallback(async (page = 1, search = searchTerm, sort = sortBy) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await getPublicTrips({
                page,
                limit: 12,
                search,
                sort
            });
            
            setTrips(response.trips);
            setPagination(response.pagination);
        } catch (err) {
            console.error('Error fetching trips:', err);
            setError('Failed to load trips. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [searchTerm, sortBy]);

    useEffect(() => {
        fetchTrips(1, searchTerm, sortBy);
        setCurrentPage(1);
    }, [searchTerm, sortBy, fetchTrips]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSortChange = (newSort) => {
        setSortBy(newSort);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchTrips(newPage, searchTerm, sortBy);
    };

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/dashboard')}
                            className="text-gray-300 hover:text-white hover:bg-gray-700/50 p-2"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Dashboard
                        </Button>
                    </div>
                    
                    <div className="text-center mb-8">
                        <div className="inline-block p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-4">
                            <Globe className="w-8 h-8 text-blue-400" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                            Community Board
                        </h1>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                            Discover amazing trips created by fellow travelers. Get inspired and plan your next adventure!
                        </p>
                    </div>

                    {/* Search and Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search trips, destinations..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-10 pr-4 py-2 w-full border-gray-600 bg-gray-800/50 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/20 backdrop-blur-sm"
                            />
                        </div>

                        {/* Sort Options */}
                        <div className="flex gap-2">
                            {sortOptions.map((option) => {
                                const IconComponent = option.icon;
                                return (
                                    <Button
                                        key={option.value}
                                        variant={sortBy === option.value ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleSortChange(option.value)}
                                        className={`flex items-center gap-2 ${
                                            sortBy === option.value
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                                : 'bg-gray-800/50 hover:bg-gray-700 border-gray-600 hover:border-blue-400 text-gray-300 hover:text-white'
                                        }`}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                        {option.label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
                        <p className="text-red-300">{error}</p>
                        <Button
                            onClick={() => fetchTrips(currentPage, searchTerm, sortBy)}
                            className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                            size="sm"
                        >
                            Try Again
                        </Button>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                            <Card key={index} className="animate-pulse bg-gray-800/50 border-gray-700">
                                <CardContent className="p-6">
                                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                                    <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
                                    <div className="h-3 bg-gray-700 rounded w-2/3 mb-4"></div>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="h-3 bg-gray-700 rounded"></div>
                                        <div className="h-3 bg-gray-700 rounded"></div>
                                        <div className="h-3 bg-gray-700 rounded"></div>
                                        <div className="h-3 bg-gray-700 rounded"></div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-gray-700 rounded-full mr-3"></div>
                                            <div className="h-3 bg-gray-700 rounded w-20"></div>
                                        </div>
                                        <div className="h-8 bg-gray-700 rounded w-20"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : trips.length === 0 ? (
                    <div className="text-center py-16">
                        <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-200 mb-2">
                            {searchTerm ? 'No trips found' : 'No trips available'}
                        </h3>
                        <p className="text-gray-400 mb-4">
                            {searchTerm 
                                ? 'Try adjusting your search terms or filters'
                                : 'Be the first to share your amazing trip with the community!'
                            }
                        </p>
                        {searchTerm && (
                            <Button
                                onClick={() => setSearchTerm('')}
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:border-blue-400 hover:text-white hover:bg-gray-700"
                            >
                                Clear Search
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Results Info */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="text-sm text-gray-400">
                                Showing {trips.length} of {pagination.total} trips
                                {searchTerm && (
                                    <span className="ml-2">
                                        for "<span className="font-medium text-gray-200">{searchTerm}</span>"
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Trips Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {trips.map((trip) => (
                                <TripCard key={trip.id} trip={trip} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="bg-gray-800/50 border-gray-600 text-gray-300 hover:border-blue-400 hover:text-white hover:bg-gray-700"
                                >
                                    Previous
                                </Button>
                                
                                {[...Array(pagination.totalPages)].map((_, index) => {
                                    const pageNum = index + 1;
                                    if (
                                        pageNum === 1 ||
                                        pageNum === pagination.totalPages ||
                                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                    ) {
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={currentPage === pageNum ? "default" : "outline"}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={
                                                    currentPage === pageNum
                                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                                        : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-blue-400 hover:text-white hover:bg-gray-700'
                                                }
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                        return <span key={pageNum} className="text-gray-600">...</span>;
                                    }
                                    return null;
                                })}
                                
                                <Button
                                    variant="outline"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.totalPages}
                                    className="bg-gray-800/50 border-gray-600 text-gray-300 hover:border-blue-400 hover:text-white hover:bg-gray-700"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CommunityBoard;
