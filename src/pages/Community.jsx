import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Plus, 
  Search, 
  Users, 
  Star,
  Send,
  X,
  Hash,
  Crown,
  UserPlus,
  Menu
} from "lucide-react";
const Community = () => {
  const { token, user } = useAuth();
  const [activeGroup, setActiveGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupAnime, setNewGroupAnime] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [showSidebar, setShowSidebar] = useState(false);

  const popularAnime = [
    "Naruto", "One Piece", "Attack on Titan", "Dragon Ball", "Demon Slayer",
    "My Hero Academia", "Death Note", "One Punch Man", "Fullmetal Alchemist",
    "Jujutsu Kaisen", "Tokyo Ghoul", "Hunter x Hunter", "Bleach", "Chainsaw Man"
  ];

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setGroups(data.groups || []);
      if (data.groups?.length > 0 && !activeGroup) {
        setActiveGroup(data.groups[0]);
      }
    } catch (err) {
      console.error("❌ Fetch groups error:", err);
    }
  };

  const fetchPosts = async (groupId) => {
    if (!groupId) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPosts(data.posts?.reverse() || []);
    } catch (err) {
      console.error("❌ Fetch posts error:", err);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim() || !newGroupAnime.trim()) return;
    
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/groups/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription,
          anime: newGroupAnime,
          isPrivate: false
        })
      });
      const data = await res.json();
      
      setGroups(prev => [...prev, data.group]);
      setActiveGroup(data.group);
      setShowCreateGroup(false);
      setNewGroupName("");
      setNewGroupDescription("");
      setNewGroupAnime("");
    } catch (err) {
      console.error("❌ Group creation failed:", err);
      alert("Failed to create group");
    }
  };

  const joinGroup = async (groupId) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        }
      });
      fetchGroups();
    } catch (err) {
      console.error("❌ Join group failed:", err);
      alert("Failed to join group");
    }
  };

  const handlePost = async () => {
    if (!newPost.trim() || !activeGroup) return;
    
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          content: newPost,
          groupId: activeGroup._id
        })
      });
      
      if (res.ok) {
        setNewPost("");
        fetchPosts(activeGroup._id);
      }
    } catch (err) {
      console.error("❌ Post creation failed:", err);
      alert("Failed to create post");
    }
  };

  const handleReaction = async (postId, reactionType) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${postId}/react`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ reactionType })
      });
      fetchPosts(activeGroup._id);
    } catch (err) {
      console.error("❌ Reaction failed:", err);
    }
  };

  const addComment = async (postId) => {
    if (!newComment[postId]?.trim()) return;
    
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ content: newComment[postId] })
      });
      setNewComment(prev => ({ ...prev, [postId]: "" }));
      fetchPosts(activeGroup._id);
    } catch (err) {
      console.error("❌ Comment failed:", err);
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  useEffect(() => {
    if (token) {
      fetchGroups();
    }
  }, [token]);

  useEffect(() => {
    if (activeGroup) {
      fetchPosts(activeGroup._id);
    }
  }, [activeGroup]);

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.anime.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -right-8 w-96 h-96 bg-gradient-to-r from-blue-400/15 to-indigo-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-1/3 w-80 h-80 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>


      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
      <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative w-80 h-full bg-black/20 backdrop-blur-xl border-r border-white/10 shadow-2xl z-50 lg:z-auto transition-transform duration-300 ease-in-out`}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
              🌸 Anime Communities
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateGroup(true)}
                className="p-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => setShowSidebar(false)}
                className="lg:hidden p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={16} />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-white/20 rounded-full focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 bg-white/10 text-white placeholder-white/60 backdrop-blur-sm"
            />
          </div>
        </div>

        <div className="overflow-y-auto h-full pb-20">
          {filteredGroups.map((group) => (
            <div
              key={group._id}
              onClick={() => {
                setActiveGroup(group);
                setShowSidebar(false);
              }}
              className={`p-4 border-b border-white/10 cursor-pointer transition-all duration-200 hover:bg-white/10 ${
                activeGroup?._id === group._id 
                  ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-l-4 border-l-pink-400' 
                  : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Hash size={14} className="text-pink-400" />
                    <h3 className="font-semibold text-white truncate">{group.name}</h3>
                    {group.isPrivate && <Crown size={12} className="text-yellow-400" />}
                  </div>
                  <p className="text-sm text-pink-300 font-medium mb-1">📺 {group.anime}</p>
                  <p className="text-xs text-white/70 truncate">{group.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {group.memberCount || 0}
                    </span>
                    <span>Online: {group.onlineCount || 0}</span>
                  </div>
                </div>
                {!group.isMember && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      joinGroup(group._id);
                    }}
                    className="p-1 rounded bg-pink-500 text-white hover:bg-pink-600 transition-colors shadow-lg"
                  >
                    <UserPlus size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {activeGroup ? (
          <>
            
            <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="lg:hidden p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    <Menu size={18} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2 truncate">
                      <Hash className="text-pink-400 flex-shrink-0" size={20} />
                      <span className="truncate">{activeGroup.name}</span>
                    </h1>
                    <p className="text-pink-300 font-medium text-sm lg:text-base">📺 {activeGroup.anime}</p>
                    <p className="text-sm text-white/70 hidden sm:block">{activeGroup.description}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Users size={16} />
                    <span>{activeGroup.memberCount || 0}</span>
                  </div>
                  <div className="text-xs text-green-400 mt-1">
                    🟢 {activeGroup.onlineCount || 0} online
                  </div>
                </div>
              </div>
            </div>

            
            <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 p-3 lg:p-4">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-3 lg:p-4 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm lg:text-base flex-shrink-0">
                      {user?.username?.[0]?.toUpperCase() || '👤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <textarea
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="w-full p-3 border border-white/20 rounded-xl resize-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 bg-white/10 text-white placeholder-white/60 backdrop-blur-sm text-sm lg:text-base"
                        placeholder={`Share your thoughts about ${activeGroup.anime}...`}
                        rows="3"
                      />
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex gap-2">
                          <button className="text-pink-400 hover:bg-white/10 p-2 rounded-full transition-colors">
                            😊
                          </button>
                          <button className="text-pink-400 hover:bg-white/10 p-2 rounded-full transition-colors">
                            📷
                          </button>
                        </div>
                        <button
                          onClick={handlePost}
                          disabled={!newPost.trim()}
                          className="px-4 lg:px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-lg text-sm lg:text-base"
                        >
                          <Send size={14} />
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 lg:p-4">
              <div className="max-w-4xl mx-auto space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
                    <span className="ml-2 text-white/70">Loading posts...</span>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🌸</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No posts yet!</h3>
                    <p className="text-white/70">Be the first to share something about {activeGroup.anime}</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div key={post._id} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-white/15">
                      <div className="p-4 lg:p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm lg:text-base flex-shrink-0">
                            {post.username?.[0]?.toUpperCase() || '👤'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-white">{post.username}</span>
                              {post.isAdmin && <Crown size={14} className="text-yellow-400" />}
                              <span className="text-xs text-white/50">
                                {new Date(post.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-white/90 leading-relaxed break-words">{post.content}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <div className="flex items-center gap-3 lg:gap-4">
                            <button
                              onClick={() => handleReaction(post._id, 'like')}
                              className="flex items-center gap-2 text-white/70 hover:text-red-400 transition-colors group"
                            >
                              <Heart size={16} className="group-hover:scale-110 transition-transform" />
                              <span className="text-sm">{post.likes?.length || 0}</span>
                            </button>
                            <button
                              onClick={() => toggleComments(post._id)}
                              className="flex items-center gap-2 text-white/70 hover:text-blue-400 transition-colors group"
                            >
                              <MessageCircle size={16} className="group-hover:scale-110 transition-transform" />
                              <span className="text-sm">{post.comments?.length || 0}</span>
                            </button>
                          </div>
                          <div className="flex gap-1" onClick={handleReaction}>
                            <button className="hover:bg-white/10 p-1 rounded transition-colors text-sm">❤️</button>
                            <button className="hover:bg-white/10 p-1 rounded transition-colors text-sm">😮</button>
                            <button className="hover:bg-white/10 p-1 rounded transition-colors text-sm">😂</button>
                            <button className="hover:bg-white/10 p-1 rounded transition-colors text-sm">😢</button>
                            <button className="hover:bg-white/10 p-1 rounded transition-colors text-sm">😡</button>
                          </div>
                        </div>

                       
                        {showComments[post._id] && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="space-y-3 mb-4">
                              {post.comments?.map((comment) => (
                                <div key={comment._id} className="flex items-start gap-2">
                                  <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {comment.username?.[0]?.toUpperCase() || '👤'}
                                  </div>
                                  <div className="flex-1 bg-white/10 rounded-lg p-2 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <span className="text-sm font-medium text-white">{comment.username}</span>
                                      <span className="text-xs text-white/50">
                                        {new Date(comment.createdAt).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-sm text-white/90 break-words">{comment.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newComment[post._id] || ""}
                                onChange={(e) => setNewComment(prev => ({ ...prev, [post._id]: e.target.value }))}
                                placeholder="Write a comment..."
                                className="flex-1 px-3 py-2 border border-white/20 rounded-full focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 text-sm bg-white/10 text-white placeholder-white/60 backdrop-blur-sm"
                                onKeyPress={(e) => e.key === 'Enter' && addComment(post._id)}
                              />
                              <button
                                onClick={() => addComment(post._id)}
                                className="px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors shadow-lg"
                              >
                                <Send size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-6xl lg:text-8xl mb-4">🌸</div>
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">Welcome to Anime Communities!</h2>
              <p className="text-white/70 mb-4">Select a group to start chatting about your favorite anime</p>
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Browse Groups
              </button>
            </div>
          </div>
        )}
      </div>
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Create New Group</h3>
              <button
                onClick={() => setShowCreateGroup(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Group Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Naruto Fans United"
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 bg-white/10 text-white placeholder-white/60 backdrop-blur-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Anime</label>
                <select
                  value={newGroupAnime}
                  onChange={(e) => setNewGroupAnime(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 bg-white/10 text-white backdrop-blur-sm"
                >
                  <option value="" className="bg-gray-800">Select an anime...</option>
                  {popularAnime.map(anime => (
                    <option key={anime} value={anime} className="bg-gray-800">{anime}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Description</label>
                <textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Describe your group..."
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400/50 resize-none bg-white/10 text-white placeholder-white/60 backdrop-blur-sm"
                  rows="3"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateGroup(false)}
                className="flex-1 px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createGroup}
                disabled={!newGroupName.trim() || !newGroupAnime.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;