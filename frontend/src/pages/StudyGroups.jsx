import { useState, useEffect, useRef, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { groupService, chatService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { format } from 'date-fns';
import { 
  PaperAirplaneIcon, 
  UserGroupIcon, 
  XMarkIcon, 
  PlusIcon, 
  UserIcon
} from '@heroicons/react/24/outline';

const StudyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const { user } = useContext(AuthContext);
  const messagesEndRef = useRef(null);
  const location = useLocation();
  
  // Check for any newly joined group from query params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const joinedGroupId = queryParams.get('groupId');
    
    if (joinedGroupId && groups.length > 0) {
      // Find the group by ID
      const joinedGroup = groups.find(g => g.group_id.toString() === joinedGroupId);
      if (joinedGroup) {
        setSelectedGroup(joinedGroup);
      }
    }
  }, [location.search, groups]);

  // Fetch user's study groups
  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const data = await groupService.getUserGroups();
        setGroups(data);
        
        // If there are groups but none selected, select the most recent one
        // This ensures that when a user clicks "Join Group" on a post and is redirected,
        // the appropriate group is selected
        if (data.length > 0 && !selectedGroup) {
          setSelectedGroup(data[0]); // Groups are ordered by most recent first
        }
      } catch (err) {
        setError('Failed to load your study groups. Please try again.');
        console.error('Error loading groups:', err);
        toast.error('Failed to load study groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Fetch messages when a group is selected
  useEffect(() => {
    if (selectedGroup) {
      fetchGroupDetails();
    }
  }, [selectedGroup]);

  // Set up polling for new messages
  useEffect(() => {
    let intervalId;
    
    if (selectedGroup) {
      // Poll for new messages every 5 seconds
      intervalId = setInterval(() => {
        fetchGroupDetails();
      }, 5000);
    }
    
    // Clean up interval on unmount or when group changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [selectedGroup]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchGroupDetails = async () => {
    setMessagesLoading(true);
    try {
      // Get group messages
      const messagesData = await chatService.getGroupMessages(selectedGroup.group_id);
      setMessages(messagesData);

      // Get group members
      const groupDetails = await groupService.getGroupDetails(selectedGroup.group_id);
      setGroupMembers(groupDetails.members || []);
    } catch (err) {
      toast.error('Failed to load group details');
      console.error('Error loading group details:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setShowDetails(false); // Hide details panel when switching groups
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;

    try {
      // Create temporary message for optimistic UI update
      const tempMessage = {
        message_id: `temp-${Date.now()}`,
        content: newMessage,
        timestamp: new Date().toISOString(),
        sender: user.name,
      };
      
      // Add to UI immediately for better UX
      setMessages(prev => [...prev, tempMessage]);
      
      // Clear input field
      const messageContent = newMessage;
      setNewMessage('');
      
      // Send via API
      await chatService.sendMessage(selectedGroup.group_id, messageContent);
      
      // Refresh to get the latest messages with proper IDs
      await fetchGroupDetails();
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to send message';
      toast.error(errorMessage);
      console.error('Error sending message:', err);
    }
  };
  
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim() || !selectedGroup) return;
    
    setAddingMember(true);
    try {
      // Call the API to invite a member
      await groupService.inviteMemberByEmail(selectedGroup.group_id, newMemberEmail);
      
      toast.success(`Invitation sent to ${newMemberEmail}`);
      setNewMemberEmail('');
      
      // Refresh the member list
      await fetchGroupDetails();
    } catch (err) {
      // Display more specific error message from the backend if available
      const errorMessage = err.response?.data?.error || 'Failed to add member';
      toast.error(errorMessage);
      console.error('Error adding member:', err);
    } finally {
      setAddingMember(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Date unavailable';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Study Groups</h1>
          <p className="mt-2 text-sm text-gray-500">
            View and chat with your study groups.
          </p>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No study groups yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Join study groups by clicking "Join Study Group" on posts.
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Groups list */}
            <div className="w-full md:w-1/3 bg-white shadow rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Your Groups</h2>
              </div>
              <ul className="divide-y divide-gray-200">
                {groups.map((group) => (
                  <li
                    key={group.group_id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedGroup?.group_id === group.group_id ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => handleGroupSelect(group)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                          <UserGroupIcon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{group.title}</p>
                        <p className="text-xs text-gray-500">
                          Created: {formatDate(group.date_created)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chat area */}
            <div className="w-full md:w-2/3 bg-white shadow rounded-lg overflow-hidden flex flex-col h-[600px]">
              {selectedGroup ? (
                <>
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">{selectedGroup.title}</h2>
                      <p className="text-xs text-gray-500">{groupMembers.length} members</p>
                    </div>
                    <button
                      className="text-sm text-primary hover:text-primary-dark"
                      onClick={() => setShowDetails(!showDetails)}
                    >
                      {showDetails ? 'Hide Details' : 'Details'}
                    </button>
                  </div>

                  {showDetails ? (
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                      <div className="bg-white p-4 rounded-lg shadow mb-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-md font-medium text-gray-900">Group Members</h3>
                          <span className="text-xs text-gray-500">{groupMembers.length} members</span>
                        </div>
                        
                        <ul className="divide-y divide-gray-200">
                          {groupMembers.map((member) => (
                            <li key={member.user_id} className="py-3 flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center mr-3">
                                <UserIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                <p className="text-xs text-gray-500">
                                  Joined: {formatDate(member.joined_at)}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-6">
                          <h3 className="text-md font-medium text-gray-900 mb-2">Add New Member</h3>
                          <form onSubmit={handleAddMember} className="flex items-start">
                            <div className="flex-grow mr-2">
                              <input
                                type="email"
                                value={newMemberEmail}
                                onChange={(e) => setNewMemberEmail(e.target.value)}
                                placeholder="Enter email address"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                required
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={addingMember || !newMemberEmail.trim()}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                            >
                              {addingMember ? (
                                <span className="flex items-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Inviting...
                                </span>
                              ) : (
                                <>
                                  <PlusIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                                  Invite
                                </>
                              )}
                            </button>
                          </form>
                          <div className="mt-2 text-xs">
                            <p className="text-gray-500">
                              An invitation will be sent to this email address to join the group.
                            </p>
                            <div className="mt-1 text-amber-600">
                              <strong>Note:</strong> The user must already have an account in the system.
                              <p className="mt-1">Sample valid emails for testing: 
                                <span className="inline-flex gap-2 mt-1">
                                  <button 
                                    type="button" 
                                    onClick={() => setNewMemberEmail('admin@example.com')}
                                    className="px-2 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200"
                                  >
                                    admin@example.com
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => setNewMemberEmail('john@example.com')}
                                    className="px-2 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200"
                                  >
                                    john@example.com
                                  </button>
                                  <button 
                                    type="button" 
                                    onClick={() => setNewMemberEmail('jane@example.com')}
                                    className="px-2 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200"
                                  >
                                    jane@example.com
                                  </button>
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Messages */}
                      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        {messagesLoading ? (
                          <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center">
                            <p className="text-gray-500">No messages yet</p>
                            <p className="text-sm text-gray-400">Be the first to send a message!</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {messages.map((message) => (
                              <div
                                key={message.message_id}
                                className={`flex ${
                                  message.sender === user.name ? 'justify-end' : 'justify-start'
                                }`}
                              >
                                <div
                                  className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                                    message.sender === user.name
                                      ? 'bg-primary text-white'
                                      : 'bg-white border border-gray-200'
                                  }`}
                                >
                                  <div className="text-xs mb-1">
                                    <span className="font-bold">{message.sender}</span> •{' '}
                                    <span className="text-opacity-75">
                                      {formatDate(message.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-sm">{message.content}</p>
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </div>
                        )}
                      </div>

                      {/* Message input */}
                      <div className="p-4 border-t border-gray-200">
                        <form onSubmit={handleSendMessage} className="flex">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-primary focus:border-primary"
                          />
                          <button
                            type="submit"
                            className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary-dark"
                            disabled={!newMessage.trim()}
                          >
                            <PaperAirplaneIcon className="h-5 w-5" />
                          </button>
                        </form>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <UserGroupIcon className="h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Select a group</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a study group from the list to view messages
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyGroups; 