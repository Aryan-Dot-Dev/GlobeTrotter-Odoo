import React from 'react'
import { Button } from "@/components/ui/button"
import { Eye, MapPin, Users, Calendar, Activity, DollarSign, CheckCircle } from "lucide-react"

const ReviewTripForm = ({ formData }) => {
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return ''
    const date = new Date(dateTimeString)
    return date.toLocaleString()
  }

  const getTotalEstimatedCost = () => {
    return formData.activities.reduce((total, activity) => {
      return total + (parseFloat(activity.estimated_cost) || 0)
    }, 0)
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-block p-3 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 mb-4">
          <Eye className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
          Review Your Trip
        </h2>
        <p className="text-gray-600">Everything looks good? Let's create your journey!</p>
      </div>

      {/* Trip Overview Cards */}
      <div className="grid gap-6">
        {/* Trip Details */}
        <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl p-6 border border-blue-100/50 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MapPin className="w-5 h-5 text-blue-500 mr-3" />
            Trip Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Title</p>
                <p className="text-gray-900">{formData.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Description</p>
                <p className="text-gray-900">{formData.description}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Trip Username</p>
                <p className="text-gray-900">{formData.public_slug}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Duration</p>
                <p className="text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                  {formData.start_date} to {formData.end_date}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Members */}
        <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-2xl p-6 border border-green-100/50 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Users className="w-5 h-5 text-green-500 mr-3" />
            Trip Members ({formData.members.length} {formData.members.length === 1 ? 'member' : 'members'})
          </h3>
          {formData.members.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {formData.members.map((member) => (
                <div key={member.id} className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center text-white font-semibold text-sm">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No members added</p>
          )}
        </div>

        {/* Trip Stops */}
        <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-2xl p-6 border border-purple-100/50 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MapPin className="w-5 h-5 text-purple-500 mr-3" />
            Journey Stops ({formData.stops.length} {formData.stops.length === 1 ? 'stop' : 'stops'})
          </h3>
          {formData.stops.length > 0 ? (
            <div className="space-y-3">
              {formData.stops.map((stop, index) => (
                <div key={stop.id} className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/50">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{stop.destination}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {stop.start_date} {stop.end_date && `- ${stop.end_date}`}
                      </p>
                      {stop.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">{stop.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No stops planned yet</p>
          )}
        </div>

        {/* Activities */}
        <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-2xl p-6 border border-emerald-100/50 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Activity className="w-5 h-5 text-emerald-500 mr-3" />
            Planned Activities ({formData.activities.length})
          </h3>
          {formData.activities.length > 0 ? (
            <div className="space-y-3">
              {formData.activities.map((activity, index) => (
                <div key={activity.id} className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/50">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center text-white font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{activity.activity}</h4>
                      {activity.description && (
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDateTime(activity.scheduled_at)}
                        </span>
                        {activity.location && (
                          <span className="flex items-center">
                            📍 {activity.location}
                          </span>
                        )}
                        {activity.estimated_cost && (
                          <span className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {activity.estimated_cost} {activity.currency}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          activity.status === 'planned' ? 'bg-blue-100 text-blue-700' :
                          activity.status === 'booked' ? 'bg-green-100 text-green-700' :
                          activity.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No activities planned yet</p>
          )}
        </div>

        {/* Trip Summary */}
        <div className="bg-gradient-to-br from-orange-50/50 to-red-50/50 rounded-2xl p-6 border border-orange-100/50 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 text-orange-500 mr-3" />
            Trip Summary
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{formData.stops.length}</div>
              <div className="text-sm text-gray-600">Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{formData.activities.length}</div>
              <div className="text-sm text-gray-600">Activities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                ₹{getTotalEstimatedCost().toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Cost</div>
            </div>
          </div>
        </div>

        {/* Ready to Create */}
        <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-2xl p-6 border border-green-100/50 shadow-sm text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to Create Your Trip!</h3>
          <p className="text-gray-600">
            Your itinerary looks amazing! Click the button below to save your trip and start your adventure.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ReviewTripForm
