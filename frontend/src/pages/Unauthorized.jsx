import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldX, Home, LogIn, ArrowLeft } from "lucide-react";

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardContent className="p-8 text-center">
                    {/* Icon */}
                    <div className="mb-6">
                        <ShieldX className="w-24 h-24 mx-auto text-red-500" />
                    </div>

                    {/* Error Code */}
                    <h1 className="text-6xl font-bold text-red-600 mb-2">401</h1>
                    
                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Unauthorized Access
                    </h2>
                    
                    {/* Description */}
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        You don't have permission to access this resource. 
                        Please log in with valid credentials to continue.
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button 
                            onClick={() => navigate('/login')}
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                        >
                            <LogIn className="w-4 h-4 mr-2" />
                            Sign In
                        </Button>
                        
                        <Button 
                            variant="outline"
                            onClick={() => navigate('/')}
                            className="w-full"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Go Home
                        </Button>
                        
                        <Button 
                            variant="ghost"
                            onClick={() => navigate(-1)}
                            className="w-full text-gray-600 hover:text-gray-800"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                    </div>

                    {/* Help Text */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                            Need help? Contact our support team if you believe this is an error.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Unauthorized;
