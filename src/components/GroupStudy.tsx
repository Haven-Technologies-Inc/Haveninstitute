import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ArrowLeft, Users, Video, Calendar, Clock, MapPin, Plus } from 'lucide-react';

interface GroupStudyProps {
  onBack: () => void;
}

interface StudySession {
  id: number;
  title: string;
  host: string;
  topic: string;
  date: string;
  time: string;
  duration: string;
  participants: number;
  maxParticipants: number;
  type: 'virtual' | 'in-person';
  location?: string;
  description: string;
}

const mockSessions: StudySession[] = [
  {
    id: 1,
    title: "Pharmacology Deep Dive: Cardiovascular Meds",
    host: "Sarah M.",
    topic: "Pharmacology",
    date: "Nov 18, 2025",
    time: "6:00 PM EST",
    duration: "90 min",
    participants: 8,
    maxParticipants: 12,
    type: "virtual",
    description: "Comprehensive review of cardiovascular medications including beta blockers, ACE inhibitors, and antiarrhythmics. Bring your questions!"
  },
  {
    id: 2,
    title: "NCLEX Test-Taking Strategies Workshop",
    host: "James T.",
    topic: "NCLEX Strategy",
    date: "Nov 19, 2025",
    time: "7:00 PM EST",
    duration: "120 min",
    participants: 15,
    maxParticipants: 20,
    type: "virtual",
    description: "Learn proven strategies for tackling NCLEX questions, priority setting, and time management during the exam."
  },
  {
    id: 3,
    title: "Maternal-Newborn Study Group",
    host: "Emily R.",
    topic: "Maternal-Newborn",
    date: "Nov 20, 2025",
    time: "5:30 PM EST",
    duration: "60 min",
    participants: 6,
    maxParticipants: 10,
    type: "virtual",
    description: "Review prenatal care, labor stages, and newborn assessment. Focus on high-yield NCLEX topics."
  },
  {
    id: 4,
    title: "Med-Surg Case Study Review",
    host: "Michael K.",
    topic: "Medical-Surgical",
    date: "Nov 21, 2025",
    time: "4:00 PM EST",
    duration: "90 min",
    participants: 10,
    maxParticipants: 15,
    type: "virtual",
    description: "Work through complex case studies covering respiratory, cardiovascular, and renal systems."
  },
  {
    id: 5,
    title: "Pediatrics & Growth Development",
    host: "Lisa P.",
    topic: "Pediatrics",
    date: "Nov 22, 2025",
    time: "6:30 PM EST",
    duration: "75 min",
    participants: 7,
    maxParticipants: 12,
    type: "virtual",
    description: "Review developmental milestones, pediatric assessments, and common childhood illnesses."
  },
  {
    id: 6,
    title: "Weekend Intensive: Lab Values & Diagnostics",
    host: "David W.",
    topic: "Fundamentals",
    date: "Nov 23, 2025",
    time: "10:00 AM EST",
    duration: "180 min",
    participants: 12,
    maxParticipants: 20,
    type: "virtual",
    description: "Comprehensive review of normal lab values, diagnostic tests, and clinical interpretation."
  }
];

export function GroupStudy({ onBack }: GroupStudyProps) {
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'my-sessions'>('upcoming');

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="size-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="size-6" />
                <h2>Group Study Sessions</h2>
              </div>
              <p className="text-gray-600">Join or host virtual study sessions with fellow students</p>
            </div>
            <Button onClick={() => setShowCreateSession(!showCreateSession)}>
              <Plus className="size-4 mr-2" />
              Create Session
            </Button>
          </div>
        </div>

        {/* Create Session Form */}
        {showCreateSession && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create Study Session</CardTitle>
              <CardDescription>Host a group study session and invite others to join</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-700 mb-2 block">Session Title</label>
                  <Input placeholder="e.g., Pharmacology Review Session" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-700 mb-2 block">Topic</label>
                    <select className="w-full p-2 border border-gray-300 rounded-md">
                      <option>Fundamentals</option>
                      <option>Pharmacology</option>
                      <option>Medical-Surgical</option>
                      <option>Pediatrics</option>
                      <option>Mental Health</option>
                      <option>Maternal-Newborn</option>
                      <option>NCLEX Strategy</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-700 mb-2 block">Max Participants</label>
                    <Input type="number" placeholder="10" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-700 mb-2 block">Date</label>
                    <Input type="date" />
                  </div>
                  <div>
                    <label className="text-gray-700 mb-2 block">Time</label>
                    <Input type="time" />
                  </div>
                </div>
                <div>
                  <label className="text-gray-700 mb-2 block">Duration (minutes)</label>
                  <Input type="number" placeholder="60" />
                </div>
                <div>
                  <label className="text-gray-700 mb-2 block">Description</label>
                  <textarea 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="What will you cover in this session?"
                  />
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1">Create Session</Button>
                  <Button variant="outline" onClick={() => setShowCreateSession(false)}>Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter Tabs */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button
                variant={filter === 'upcoming' ? 'default' : 'outline'}
                onClick={() => setFilter('upcoming')}
              >
                Upcoming Sessions
              </Button>
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All Sessions
              </Button>
              <Button
                variant={filter === 'my-sessions' ? 'default' : 'outline'}
                onClick={() => setFilter('my-sessions')}
              >
                My Sessions
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Card */}
        <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle>Why Study in Groups?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="mb-2">🎯 Stay Accountable</h4>
                <p className="text-gray-700">Regular sessions keep you on track with your study goals</p>
              </div>
              <div>
                <h4 className="mb-2">💡 Learn from Peers</h4>
                <p className="text-gray-700">Different perspectives help clarify difficult concepts</p>
              </div>
              <div>
                <h4 className="mb-2">🤝 Build Community</h4>
                <p className="text-gray-700">Connect with others on the same journey to NCLEX success</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Sessions List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockSessions.map(session => (
            <Card key={session.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="flex-1">{session.title}</CardTitle>
                  <Badge>{session.topic}</Badge>
                </div>
                <CardDescription>Hosted by {session.host}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{session.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="size-4" />
                    <span>{session.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="size-4" />
                    <span>{session.time} ({session.duration})</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    {session.type === 'virtual' ? (
                      <Video className="size-4" />
                    ) : (
                      <MapPin className="size-4" />
                    )}
                    <span>{session.type === 'virtual' ? 'Virtual Session' : session.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="size-4" />
                    <span>{session.participants}/{session.maxParticipants} participants</span>
                  </div>
                </div>

                {/* Progress bar for participants */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(session.participants / session.maxParticipants) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    Join Session
                  </Button>
                  <Button variant="outline">
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
