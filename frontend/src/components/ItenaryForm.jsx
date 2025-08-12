import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, MapPin, Navigation } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const ItenaryForm = ({ formData, updateFormData }) => {
  const [currentStop, setCurrentStop] = useState({
    destination: '',
    start_date: '',
    end_date: '',   
    notes: ''
  })

  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  })

  const handleDateRangeChange = (range) => {
    setDateRange(range || { from: undefined, to: undefined })
    
    if (range?.from) {
      const newStartDate = format(range.from, 'yyyy-MM-dd')
      setCurrentStop(prev => ({ ...prev, start_date: newStartDate }))
    } else {
      setCurrentStop(prev => ({ ...prev, start_date: '' }))
    }
    
    if (range?.to) {
      const newEndDate = format(range.to, 'yyyy-MM-dd')
      setCurrentStop(prev => ({ ...prev, end_date: newEndDate }))
    } else {
      setCurrentStop(prev => ({ ...prev, end_date: '' }))
    }
  }

  const addStop = () => {
    if (currentStop.destination && currentStop.start_date) {
      updateFormData('stops', [...formData.stops, { ...currentStop, id: Date.now() }])
      setCurrentStop({
        destination: '',
        start_date: '',
        end_date: '',
        notes: ''
      })
    }
  }

  const removeStop = (id) => {
    updateFormData('stops', formData.stops.filter(stop => stop.id !== id))
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-block p-3 rounded-full bg-gray-100 mb-4">
          <Navigation className="w-8 h-8 text-gray-800" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Plan Your Stops
        </h2>
        <p className="text-gray-600">Map out your journey destinations</p>
      </div>

      {/* Add Stop Section */}
      <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200/50 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <div className="w-2 h-2 rounded-full bg-gray-800 mr-3"></div>
          Add New Stop
        </h3>
        
        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="destination" className="text-sm font-medium text-gray-700">Destination</Label>
            <Input
              id="destination"
              value={currentStop.destination}
              onChange={(e) => setCurrentStop(prev => ({ ...prev, destination: e.target.value }))}
              placeholder="Where are you going?"
              className="border-gray-200 focus:border-gray-400 focus:ring-gray-400/20 bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Stay Duration</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-gray-200 hover:border-gray-400 hover:bg-gray-50/50 bg-white/80 backdrop-blur-sm transition-all duration-200",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Select your stay dates</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-gray-200 shadow-xl" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                  className="rounded-lg"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes (Optional)</Label>
            <Input
              id="notes"
              value={currentStop.notes}
              onChange={(e) => setCurrentStop(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Special notes about this destination"
              className="border-gray-200 focus:border-gray-400 focus:ring-gray-400/20 bg-white/80 backdrop-blur-sm"
            />
          </div>

          <Button 
            type="button"
            onClick={addStop} 
            disabled={!currentStop.destination || !currentStop.start_date}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white shadow-sm"
          >
            🗺️ Add Stop
          </Button>
        </div>
      </div>

      {/* Display added stops */}
      {formData.stops.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <div className="w-2 h-2 rounded-full bg-gray-800 mr-3"></div>
            Your Journey ({formData.stops.length} stops)
          </h3>
          <div className="space-y-4">
            {formData.stops.map((stop, index) => (
              <div key={stop.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                        {stop.destination}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {stop.start_date} {stop.end_date && `- ${stop.end_date}`}
                      </p>
                      {stop.notes && (
                        <p className="text-sm text-gray-500 mt-2 italic">{stop.notes}</p>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => removeStop(stop.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ItenaryForm