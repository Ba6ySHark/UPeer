from rest_framework import permissions

class IsAuthenticated(permissions.BasePermission):
    """
    Custom permission to check if the user is authenticated.
    Works with our CustomUser class.
    """
    def has_permission(self, request, view):
        return bool(request.user and getattr(request.user, 'is_authenticated', False))

class IsAdmin(permissions.BasePermission):
    """
    Custom permission to check if the user is an admin.
    Works with our CustomUser class.
    """
    def has_permission(self, request, view):
        return bool(request.user and getattr(request.user, 'is_admin', False))

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to allow owners of an object or admins to modify it.
    """
    def has_object_permission(self, request, view, obj):
        # Check if user is admin first
        if getattr(request.user, 'is_admin', False):
            return True
            
        # Check if obj has user_id attribute and it matches the request user's ID
        if hasattr(obj, 'user_id'):
            return obj.user_id == getattr(request.user, 'user_id', None)
        
        return False 