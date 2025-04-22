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
  // Get all posts (with optional course filter)
  getPosts: async (courseId = null) => {
    const url = courseId 
      ? `/api/posts/?course_id=${courseId}` 
      : `/api/posts/`;
    const response = await axiosInstance.get(url);
    return response.data;
  },
  
  // Create a new post
  createPost: async (content, courseId = null) => {
    const data = { content };
    if (courseId) data.course_id = courseId;
    
    const response = await axiosInstance.post(`/api/posts/`, data);
    return response.data;
  },
  
  // Update a post
  updatePost: async (postId, content) => {
    const response = await axiosInstance.put(`/api/posts/${postId}/`, { content });
    return response.data;
  },
  
  // Delete a post
  deletePost: async (postId) => {
    const response = await axiosInstance.delete(`/api/posts/${postId}/`);
    return response.data;
  },
  
  // Report a post
  reportPost: async (postId) => {
    const response = await axiosInstance.post(`/api/posts/${postId}/report/`);
    return response.data;
  },
  
  // Get reported posts (admin only)
  getReportedPosts: async () => {
    const response = await axiosInstance.get(`/api/posts/reported/`);
    return response.data;
  }
};

// Study group services
export const groupService = {
  // Get all groups the user is a member of
  getUserGroups: async () => {
    const response = await axiosInstance.get(`/api/groups/`);
    return response.data;
  },
  
  // Create a new study group
  createGroup: async (title) => {
    const response = await axiosInstance.post(`/api/groups/`, { title });
    return response.data;
  },
  
  // Get group details and members
  getGroupDetails: async (groupId) => {
    const response = await axiosInstance.get(`/api/groups/${groupId}/`);
    return response.data;
  },
  
  // Join a study group
  joinGroup: async (groupId) => {
    const response = await axiosInstance.post(`/api/groups/join/`, { group_id: groupId });
    return response.data;
  },
  
  // Leave a study group
  leaveGroup: async (groupId) => {
    const response = await axiosInstance.delete(`/api/groups/${groupId}/leave/`);
    return response.data;
  }
};

// Chat services
export const chatService = {
  // Get all messages for a group
  getGroupMessages: async (groupId) => {
    const response = await axiosInstance.get(`/api/chat/${groupId}/messages/`);
    return response.data;
  }
}; 