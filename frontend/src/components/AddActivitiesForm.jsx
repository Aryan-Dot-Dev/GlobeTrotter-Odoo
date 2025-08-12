import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Activity, Clock, DollarSign, Edit, Trash2, Save, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const AddActivitiesForm = ({ formData, updateFormData }) => {
  const [currentActivity, setCurrentActivity] = useState({
    activity: '',
    location: '',
    description: '',
    scheduled_at: '',
    duration_minutes: '',
    estimated_cost: '',
    currency: 'INR',
    status: 'planned'
  })

  const [selectedDate, setSelectedDate] = useState()
  const [selectedTime, setSelectedTime] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    if (date && selectedTime) {
      // Combine date and time
      const dateTimeString = `${format(date, 'yyyy-MM-dd')}T${selectedTime}`
      setCurrentActivity(prev => ({ ...prev, scheduled_at: dateTimeString }))
    } else if (date) {
      // Just date, no time yet
      const dateString = format(date, 'yyyy-MM-dd')
      setCurrentActivity(prev => ({ ...prev, scheduled_at: dateString }))
    }
  }

  const handleTimeChange = (time) => {
    setSelectedTime(time)
    if (selectedDate && time) {
      // Combine date and time
      const dateTimeString = `${format(selectedDate, 'yyyy-MM-dd')}T${time}`
      setCurrentActivity(prev => ({ ...prev, scheduled_at: dateTimeString }))
    }
  }

  const addActivity = () => {
    if (currentActivity.activity && currentActivity.scheduled_at && currentActivity.location) {
      updateFormData('activities', [...formData.activities, { ...currentActivity, id: Date.now() }])
      setCurrentActivity({
        activity: '',
        location: '',
        description: '',
        scheduled_at: '',
        duration_minutes: '',
        estimated_cost: '',
        currency: 'INR',
        status: 'planned'
      })
      setSelectedDate(undefined)
      setSelectedTime('')
    }
  }

  const removeActivity = (id) => {
    updateFormData('activities', formData.activities.filter(item => item.id !== id))
  }

  const startEdit = (activity) => {
    // Cancel any existing edit first to ensure only one activity is being edited
    if (editingId !== null && editingId !== activity.id) {
      setEditForm({})
    }
    
    setEditingId(activity.id)
    
    // Properly format the scheduled_at for datetime-local input
    let formattedDateTime = '';
    if (activity.scheduled_at) {
      try {
        const date = new Date(activity.scheduled_at);
        if (!isNaN(date.getTime())) {
          // Format as YYYY-MM-DDTHH:MM for datetime-local input
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
      } catch (error) {
        console.warn('Error formatting date:', error);
      }
    }
    
    setEditForm({
      activity: activity.activity || '',
      location: activity.location || '',
      description: activity.description || '',
      scheduled_at: formattedDateTime,
      duration_minutes: activity.duration_minutes || '',
      estimated_cost: activity.estimated_cost || '',
      currency: activity.currency || 'USD',
      status: activity.status || 'planned'
    })
  }

  const saveEdit = () => {
    // Ensure the datetime is properly formatted before saving
    const updatedActivity = { ...editForm };
    
    // If scheduled_at is provided, ensure it's in the correct format
    if (updatedActivity.scheduled_at) {
      // If it's already in datetime-local format (YYYY-MM-DDTHH:MM), append seconds
      if (updatedActivity.scheduled_at.length === 16) {
        updatedActivity.scheduled_at = updatedActivity.scheduled_at + ':00';
      }
    }
    
    const updatedActivities = formData.activities.map(activity =>
      activity.id === editingId
        ? { ...activity, ...updatedActivity }
        : activity
    )
    updateFormData('activities', updatedActivities)
    setEditingId(null)
    setEditForm({})
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return ''
    try {
      const date = new Date(dateTimeString)
      if (isNaN(date.getTime())) return ''
      return date.toLocaleString()
    } catch {
      return ''
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-block p-3 rounded-full bg-gray-100 mb-4">
          <Activity className="w-8 h-8 text-gray-800" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Schedule Activities
        </h2>
        <p className="text-gray-600">Plan your experiences and adventures</p>
      </div>

      {/* Add Activity Section */}
      <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200/50 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <div className="w-2 h-2 rounded-full bg-gray-800 mr-3"></div>
          Add New Activity
        </h3>
        
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activity" className="text-sm font-medium text-gray-700">Activity Name</Label>
              <Input
                id="activity"
                value={currentActivity.activity}
                onChange={(e) => setCurrentActivity(prev => ({ ...prev, activity: e.target.value }))}
                placeholder="What will you do?"
                className="border-gray-200 focus:border-green-400 focus:ring-green-400/20 bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stop_id" className="text-sm font-medium text-gray-700">Location</Label>
              <select
                id="stop_id"
                value={currentActivity.location}
                onChange={(e) => {
                  setCurrentActivity(prev => ({ 
                    ...prev, 
                    location: e.target.value
                  }));
                }}
                className="w-full p-2 border border-gray-200 rounded-md bg-white/80 backdrop-blur-sm focus:border-green-400 focus:ring-green-400/20"
              >
                <option value="">Select a destination</option>
                {formData.stops.map((stop) => (
                  <option key={stop.id} value={stop.destination}>
                    {stop.destination}
                  </option>
                ))}
              </select>
              {formData.stops.length === 0 && (
                <p className="text-sm text-amber-600 mt-1">Please add stops first before adding activities</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
            <Input
              id="description"
              value={currentActivity.description}
              onChange={(e) => setCurrentActivity(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the activity"
              className="border-gray-200 focus:border-green-400 focus:ring-green-400/20 bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center">
                <CalendarIcon className="w-4 h-4 text-green-500 mr-2" />
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-gray-200 hover:border-green-400 hover:bg-green-50/50 bg-white/80 backdrop-blur-sm transition-all duration-200",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-green-500" />
                    {selectedDate ? format(selectedDate, "MMM dd") : <span>Pick date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-gray-200 shadow-xl">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="rounded-lg"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 flex items-center">
                <Clock className="w-4 h-4 text-green-500 mr-2" />
                Time
              </Label>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="border-gray-200 focus:border-green-400 focus:ring-green-400/20 bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes" className="text-sm font-medium text-gray-700">Duration (min)</Label>
              <Input
                id="duration_minutes"
                type="number"
                value={currentActivity.duration_minutes}
                onChange={(e) => setCurrentActivity(prev => ({ ...prev, duration_minutes: e.target.value }))}
                placeholder="120"
                className="border-gray-200 focus:border-green-400 focus:ring-green-400/20 bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_cost" className="text-sm font-medium text-gray-700 flex items-center">
                <DollarSign className="w-4 h-4 text-green-500 mr-2" />
                Cost
              </Label>
              <Input
                id="estimated_cost"
                type="number"
                step="0.01"
                value={currentActivity.estimated_cost}
                onChange={(e) => setCurrentActivity(prev => ({ ...prev, estimated_cost: e.target.value }))}
                placeholder="0.00"
                className="border-gray-200 focus:border-green-400 focus:ring-green-400/20 bg-white/80 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-medium text-gray-700">Currency</Label>
              <select
                id="currency"
                value={currentActivity.currency}
                onChange={(e) => setCurrentActivity(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full p-2 border border-gray-200 rounded-md bg-white/80 backdrop-blur-sm focus:border-green-400 focus:ring-green-400/20"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
              <select
                id="status"
                value={currentActivity.status}
                onChange={(e) => setCurrentActivity(prev => ({ ...prev, status: e.target.value }))}
                className="w-full p-2 border border-gray-200 rounded-md bg-white/80 backdrop-blur-sm focus:border-green-400 focus:ring-green-400/20"
              >
                <option value="planned">Planned</option>
                <option value="booked">Booked</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <Button 
            type="button"
            onClick={addActivity} 
            disabled={!currentActivity.activity || !currentActivity.scheduled_at || !currentActivity.location}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-sm"
          >
            ⚡ Add Activity
          </Button>
        </div>
      </div>

      {/* Display added activities */}
      {formData.activities.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-teal-500 mr-3"></div>
            Planned Activities ({formData.activities.length})
          </h3>
          <div className="space-y-4">
            {formData.activities.map((activity) => (
              <div key={activity.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm hover:shadow-md transition-all duration-200">
                {editingId === activity.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Activity Name</Label>
                        <Input
                          value={editForm.activity}
                          onChange={(e) => setEditForm(prev => ({ ...prev, activity: e.target.value }))}
                          className="mt-1"
                          placeholder="Activity name"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Location</Label>
                        <select
                          value={editForm.location}
                          onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full mt-1 p-2 border border-gray-200 rounded-md bg-white/80"
                        >
                          <option value="">Select location</option>
                          {formData.stops.map(stop => (
                            <option key={stop.id} value={stop.destination}>
                              {stop.destination}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Description</Label>
                      <Input
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        className="mt-1"
                        placeholder="Activity description"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Date & Time</Label>
                        <Input
                          type="datetime-local"
                          value={editForm.scheduled_at || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, scheduled_at: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Duration (mins)</Label>
                        <Input
                          type="number"
                          value={editForm.duration_minutes}
                          onChange={(e) => setEditForm(prev => ({ ...prev, duration_minutes: e.target.value }))}
                          className="mt-1"
                          placeholder="120"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Cost</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="number"
                            value={editForm.estimated_cost}
                            onChange={(e) => setEditForm(prev => ({ ...prev, estimated_cost: e.target.value }))}
                            placeholder="0"
                            className="flex-1"
                          />
                          <select
                            value={editForm.currency}
                            onChange={(e) => setEditForm(prev => ({ ...prev, currency: e.target.value }))}
                            className="w-20 p-2 border border-gray-200 rounded-md bg-white/80"
                          >
                            <option value="INR">INR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Status</Label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full mt-1 p-2 border border-gray-200 rounded-md bg-white/80"
                      >
                        <option value="planned">Planned</option>
                        <option value="booked">Booked</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={saveEdit}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        onClick={cancelEdit}
                        variant="outline"
                        size="sm"
                        className="border-gray-300"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-teal-400 flex items-center justify-center text-white">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{activity.activity}</h4>
                        {activity.description && (
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center">
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            {formatDateTime(activity.scheduled_at)}
                          </span>
                          {activity.location && (
                            <span className="flex items-center">
                              📍 {activity.location}
                            </span>
                          )}
                          {activity.duration_minutes && (
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {activity.duration_minutes} mins
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
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => startEdit(activity)}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeActivity(activity.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AddActivitiesForm