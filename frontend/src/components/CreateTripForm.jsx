import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, MapPin } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const CreateTripForm = ({ formData, updateFormData }) => {
  const [currentMember, setCurrentMember] = useState({
    email: '',
    name: ''
  })

  const [dateRange, setDateRange] = useState({
    from: formData.start_date ? new Date(formData.start_date) : undefined,
    to: formData.end_date ? new Date(formData.end_date) : undefined,
  })

  const handleDateRangeChange = (range) => {
    setDateRange(range || { from: undefined, to: undefined })

    if (range?.from) {
      updateFormData('start_date', format(range.from, 'yyyy-MM-dd'))
    } else {
      updateFormData('start_date', '')
    }

    if (range?.to) {
      updateFormData('end_date', format(range.to, 'yyyy-MM-dd'))
    } else {
      updateFormData('end_date', '')
    }
  }

  const addMember = () => {
    if (currentMember.email && currentMember.name) {
      const newMember = {
        ...currentMember,
        id: Date.now()
      }
      updateFormData('members', [...formData.members, newMember])
      setCurrentMember({ email: '', name: '' })
    }
  }

  const removeMember = (id) => {
    updateFormData('members', formData.members.filter(member => member.id !== id))
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-block p-3 rounded-full bg-gray-100 mb-4">
          <MapPin className="w-8 h-8 text-gray-800" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Trip Details & Members
        </h2>
        <p className="text-gray-600">Let's start planning your perfect journey</p>
      </div>

      {/* Trip Information Section */}
      <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200/50 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <div className="w-2 h-2 rounded-full bg-gray-800 mr-3"></div>
          Basic Information
        </h3>

        <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">Trip Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              placeholder="Enter your amazing trip title"
              className="border-gray-200 focus:border-gray-400 focus:ring-gray-400/20 bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div>
            <Label htmlFor="start" className="text-sm font-medium text-gray-700">Trip Start Destination</Label>
            <Input
              id="start"
              value={formData.start}
              onChange={(e) => updateFormData('start', e.target.value)}
              placeholder="Enter your trip start destination"
              className="border-gray-200 focus:border-gray-400 focus:ring-gray-400/20 bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div>
            <Label htmlFor="end" className="text-sm font-medium text-gray-700">Trip End Destination</Label>
            <Input
              id="end"
              value={formData.end}
              onChange={(e) => updateFormData('end', e.target.value)}
              placeholder="Enter your trip end destination"
              className="border-gray-200 focus:border-gray-400 focus:ring-gray-400/20 bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Describe your trip adventure"
              className="border-gray-200 focus:border-gray-400 focus:ring-gray-400/20 bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Trip Dates</Label>
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
                    <span>Pick your travel dates</span>
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
        </div>
      </div>

      {/* Trip Members Section */}
      <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200/50 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <div className="w-2 h-2 rounded-full bg-gray-800 mr-3"></div>
          Trip Members
        </h3>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
          <h4 className="font-medium text-gray-700 mb-4">Add New Member</h4>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="memberEmail" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="memberEmail"
                type="email"
                value={currentMember.email}
                onChange={(e) => setCurrentMember(prev => ({ ...prev, email: e.target.value }))}
                placeholder="member@example.com"
                className="border-gray-200 focus:border-gray-400 focus:ring-gray-400/20 bg-white/80"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="memberName" className="text-sm font-medium text-gray-700">Name</Label>
              <Input
                id="memberName"
                value={currentMember.name}
                onChange={(e) => setCurrentMember(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Full name"
                className="border-gray-200 focus:border-gray-400 focus:ring-gray-400/20 bg-white/80"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={addMember}
            disabled={!currentMember.email || !currentMember.name}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white shadow-sm"
          >
            ✨ Add Member
          </Button>
        </div>

        {/* Display added members */}
        {formData.members.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-3">Trip Members ({formData.members.length})</h4>
            <div className="space-y-3">
              {formData.members.map((member) => (
                <div key={member.id} className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-semibold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeMember(member.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateTripForm