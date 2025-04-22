import axiosInstance from './axiosConfig';
import { API_URL } from '../config';

// Course services
export const courseService = {
  // Get all courses
  getAllCourses: async () => {
    const response = await axiosInstance.get(`/api/courses/`);
    return response.data;
  },
  
  // Get user's enrolled courses
  getUserCourses: async () => {
    const response = await axiosInstance.get(`/api/courses/mine/`);
    return response.data;
  },
  
  // Enroll in a course
  enrollCourse: async (courseId) => {
    const response = await axiosInstance.post(`/api/courses/enrol/`, { course_id: courseId });
    return response.data;
  },
  
  // Unenroll from a course
  unenrollCourse: async (courseId) => {
    const response = await axiosInstance.delete(`/api/courses/enrol/${courseId}/`);
    return response.data;
  }
};

// Post services
export const postService = {
  // Get all posts (with optional course filter and post type)
  getPosts: async (courseId = null, type = null) => {
    let url = '/api/posts/';
    const params = new URLSearchParams();
    
    if (courseId) params.append('course_id', courseId);
    if (type) params.append('type', type);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    const response = await axiosInstance.get(url);
    return response.data;
  },
  
  // Create a new post
  createPost: async (content, courseId = null, type = 'seeking') => {
    const data = { 
      content,
      type
    };
    if (courseId) data.course_id = courseId;
    
    const response = await axiosInstance.post('/api/posts/', data);
    return response.data;
  },
  
  // Update a post
  updatePost: async (postId, content) => {
    const response = await axiosInstance.put(`/api/posts/${postId}/`, { content });
    return response.data;
  },
  
  // Delete a post
  deletePost: async (postId) => {
    await axiosInstance.delete(`/api/posts/${postId}/`);
    return { success: true };
  },
  
  // Report a post
  reportPost: async (postId, reason) => {
    const response = await axiosInstance.post(`/api/posts/${postId}/report/`, { reason });
    return response.data;
  },
  
  // Get reported posts (admin only)
  getReportedPosts: async () => {
    const response = await axiosInstance.get('/api/posts/reported/');
    return response.data;
  }
};

// Comment services
export const commentService = {
  // Get comments for a post
  getPostComments: async (postId) => {
    if (!postId) {
      console.error('Post ID is required to fetch comments');
      return [];
    }
    const response = await axiosInstance.get(`/api/posts/${postId}/comments/`);
    return response.data;
  },
  
  // Create a new comment
  createComment: async ({ post_id, content, parent_id = null }) => {
    if (!post_id) {
      throw new Error('Post ID is required to create a comment');
    }
    
    const data = { content };
    if (parent_id) data.parent_id = parent_id;
    
    const response = await axiosInstance.post(`/api/posts/${post_id}/comments/`, data);
    return response.data;
  },
  
  // Update a comment
  updateComment: async (commentId, content) => {
    if (!commentId) {
      throw new Error('Comment ID is required to update a comment');
    }
    
    const response = await axiosInstance.put(`/api/comments/${commentId}/`, { content });
    return response.data;
  },
  
  // Delete a comment
  deleteComment: async (commentId) => {
    if (!commentId) {
      throw new Error('Comment ID is required to delete a comment');
    }
    
    const response = await axiosInstance.delete(`/api/comments/${commentId}/`);
    return response.data;
  }
};

// Study group services
export const groupService = {
  // Get all groups for the user
  getUserGroups: async () => {
    const response = await axiosInstance.get('/api/groups/');
    return response.data;
  },
  
  // Create a new group
  createGroup: async (title) => {
    const response = await axiosInstance.post('/api/groups/', { title });
    return response.data;
  },
  
  // Get group details and members
  getGroupDetails: async (groupId) => {
    const response = await axiosInstance.get(`/api/groups/${groupId}/`);
    return response.data;
  },
  
  // Join a group
  joinGroup: async (groupId) => {
    const response = await axiosInstance.post(`/api/groups/${groupId}/join/`);
    return response.data;
  },
  
  // Leave a group
  leaveGroup: async (groupId) => {
    const response = await axiosInstance.post(`/api/groups/${groupId}/leave/`);
    return response.data;
  },
  
  // Create a study group from a post
  createFromPost: async (postId, title) => {
    const response = await axiosInstance.post(`/api/posts/${postId}/create-group/`, { title });
    return response.data;
  },
  
  // Join a group from a post
  joinGroupFromPost: async (postId) => {
    const response = await axiosInstance.post(`/api/posts/${postId}/join-group/`);
    return response.data;
  },
  
  // Invite a member to a group by email
  inviteMemberByEmail: async (groupId, email) => {
    const response = await axiosInstance.post(`/api/groups/${groupId}/invite/`, { email });
    return response.data;
  }
};

// Chat services
export const chatService = {
  // Get all messages for a group
  getGroupMessages: async (groupId) => {
    const response = await axiosInstance.get(`/api/chat/${groupId}/messages/`);
    return response.data;
  },
  
  // Send a message to a group
  sendMessage: async (groupId, content) => {
    const response = await axiosInstance.post(`/api/chat/${groupId}/messages/`, { content });
    return response.data;
  }
}; 