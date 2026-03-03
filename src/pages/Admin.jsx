import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Users, Calendar, DollarSign, MapPin, Search, Filter,
  ChevronDown, Eye, Phone, Mail, Clock, Building2, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createPageUrl } from '@/utils';

const serviceLabels = {
  interior: 'Interior Painting',
  exterior: 'Exterior Painting',
  cabinet: 'Cabinet Painting',
  trim: 'Trim & Doors',
  deck: 'Deck & Fence'
};

const statusColors = {
  waitlist: 'bg-slate-100 text-slate-700',
  quote_generated: 'bg-blue-100 text-blue-700',
  booked: 'bg-emerald-100 text-emerald-700',
  confirmed: 'bg-purple-100 text-purple-700',
  completed: 'bg-amber-100 text-amber-700'
};

export default function Admin() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list('-created_date'),
  });

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchQuery || 
      lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.zip?.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: leads.length,
    booked: leads.filter(l => l.status === 'booked').length,
    waitlist: leads.filter(l => l.is_waitlist).length,
    totalValue: leads.reduce((sum, l) => sum + ((l.estimate_low || 0) + (l.estimate_high || 0)) / 2, 0)
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#1e3a5f] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={() => window.location.href = createPageUrl('Home')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold">★</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">Ghost Quote Admin</h1>
                  <p className="text-sm text-white/70">Lead Management Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Leads', value: stats.total, icon: Users, color: 'bg-blue-500' },
            { label: 'Booked', value: stats.booked, icon: Calendar, color: 'bg-emerald-500' },
            { label: 'Waitlist', value: stats.waitlist, icon: Clock, color: 'bg-amber-500' },
            { label: 'Est. Pipeline', value: `$${Math.round(stats.totalValue).toLocaleString()}`, icon: DollarSign, color: 'bg-purple-500' }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, or zip..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 rounded-xl">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="waitlist">Waitlist</SelectItem>
                <SelectItem value="quote_generated">Quote Generated</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading leads...
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-medium">No leads found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Date</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Zip</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Estimate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Territory</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">
                        {lead.created_date ? format(new Date(lead.created_date), 'MMM d, yyyy') : '-'}
                        <br />
                        <span className="text-xs text-slate-500">
                          {lead.created_date ? format(new Date(lead.created_date), 'h:mm a') : ''}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{lead.name || '-'}</p>
                          <p className="text-sm text-slate-500">{lead.email || '-'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {lead.zip}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.service ? (
                          <span className="text-sm">{serviceLabels[lead.service] || lead.service}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.estimate_low && lead.estimate_high ? (
                          <span className="font-medium">
                            ${lead.estimate_low.toLocaleString()} – ${lead.estimate_high.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[lead.status] || 'bg-slate-100'} border-0`}>
                          {lead.status?.replace('_', ' ') || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lead.territory_owner ? (
                          <div className="text-sm">
                            <p className="font-medium">{lead.territory_owner}</p>
                            <p className="text-slate-500">{lead.territory_location}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLead(lead)}
                          className="gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      {/* Lead Detail Modal */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-500 mb-1">Name</p>
                  <p className="font-semibold">{selectedLead.name || '-'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-500 mb-1">Status</p>
                  <Badge className={`${statusColors[selectedLead.status] || 'bg-slate-100'} border-0`}>
                    {selectedLead.status?.replace('_', ' ') || 'pending'}
                  </Badge>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3">
                  <Mail className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium">{selectedLead.email || '-'}</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3">
                  <Phone className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-medium">{selectedLead.phone || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Address & Zip */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                  <div>
                    <p className="text-sm text-slate-500">Address</p>
                    <p className="font-medium">{selectedLead.address || selectedLead.zip || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Service & Estimate */}
              {selectedLead.service && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1e3a5f]/5 rounded-xl p-4">
                    <p className="text-sm text-slate-500 mb-1">Service</p>
                    <p className="font-semibold text-[#1e3a5f]">
                      {serviceLabels[selectedLead.service] || selectedLead.service}
                    </p>
                  </div>
                  {selectedLead.estimate_low && (
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <p className="text-sm text-slate-500 mb-1">Estimate</p>
                      <p className="font-semibold text-emerald-700">
                        ${selectedLead.estimate_low.toLocaleString()} – ${selectedLead.estimate_high?.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Booking Info */}
              {selectedLead.booked_date && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm text-amber-700">Appointment Scheduled</p>
                      <p className="font-semibold text-amber-900">
                        {format(new Date(selectedLead.booked_date), 'EEEE, MMMM d, yyyy')} at {selectedLead.booked_time}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Territory Owner */}
              {selectedLead.territory_owner && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Assigned Territory</p>
                      <p className="font-semibold">{selectedLead.territory_owner}</p>
                      <p className="text-sm text-slate-500">{selectedLead.territory_location}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Project Details */}
              {selectedLead.project_details && Object.keys(selectedLead.project_details).length > 0 && (
                <div>
                  <p className="font-semibold text-slate-900 mb-2">Project Details</p>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                      {JSON.stringify(selectedLead.project_details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Photos */}
              {selectedLead.photos && selectedLead.photos.length > 0 && (
                <div>
                  <p className="font-semibold text-slate-900 mb-2">Project Photos ({selectedLead.photos.length})</p>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedLead.photos.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square rounded-lg overflow-hidden bg-slate-100"
                      >
                        <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover hover:opacity-75 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-sm text-slate-500 border-t pt-4">
                <p>Created: {selectedLead.created_date ? format(new Date(selectedLead.created_date), 'PPpp') : '-'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}