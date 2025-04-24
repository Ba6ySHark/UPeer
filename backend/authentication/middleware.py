from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import jwt
from django.conf import settings
from .models import UserManager
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
import logging

# Get logger for this module
logger = logging.getLogger('django')

# Custom User class that wraps dict data
class CustomUser:
    def __init__(self, user_dict):
        for key, value in user_dict.items():
            setattr(self, key, value)
        self.is_authenticated = True
        self.is_active = True
        
    def __str__(self):
        return self.name
        
    def get(self, key, default=None):
        return getattr(self, key, default)


class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None
        
        try:
            # Check if the header has the Bearer prefix
            prefix, token = auth_header.split(' ')
            if prefix.lower() != 'bearer':
                return None
        except ValueError:
            return None
        
        try:
            # Decode the JWT token
            # First try without validation for detailed debugging
            try:
                decoded_payload = jwt.decode(token, options={"verify_signature": False})
                logger.debug(f"Token payload (unverified): {decoded_payload}")
            except Exception as e:
                logger.error(f"Token is completely malformed: {str(e)}")
            
            # Now properly decode with validation
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            logger.debug(f"Token decoded successfully: {payload}")
            
            user_id = payload.get('user_id')
            if not user_id:
                raise AuthenticationFailed('Invalid token payload')
            
            # Get the user from database
            user_dict = UserManager.get_user_by_id(user_id)
            if not user_dict:
                raise AuthenticationFailed('User not found')
            
            # Convert dict to CustomUser object
            user = CustomUser(user_dict)
            return (user, token)
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')
        
    def authenticate_header(self, request):
        return 'Bearer'

class JWTMiddleware(MiddlewareMixin):
    """
    Django middleware that processes JWT authentication for regular Django views
    This is used in addition to the DRF authentication classes
    """
    def process_request(self, request):
        # Skip authentication for paths that don't need it
        exempt_paths = [
            '/api/auth/login/', 
            '/api/auth/register/',
            '/admin/', 
            '/api/docs/',
            '/static/'
        ]
        
        # Check if request path starts with any exempt path
        if any(request.path.startswith(path) for path in exempt_paths):
            logger.debug(f"Path exempt from HTTP authentication: {request.path}")
            return None
            
        # Skip OPTIONS requests (for CORS preflight)
        if request.method == 'OPTIONS':
            return None
            
        # Get the token from the Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return JsonResponse({'error': 'Authentication required'}, status=401)
            
        try:
            # Check if the header has the Bearer prefix
            prefix, token = auth_header.split(' ')
            if prefix.lower() != 'bearer':
                return JsonResponse({'error': 'Invalid authorization format'}, status=401)
        except ValueError:
            return JsonResponse({'error': 'Invalid authorization format'}, status=401)
            
        try:
            # Decode the JWT token
            # First try without validation for detailed debugging
            try:
                decoded_payload = jwt.decode(token, options={"verify_signature": False})
                logger.debug(f"Token payload (unverified): {decoded_payload}")
            except Exception as e:
                logger.error(f"Token is completely malformed: {str(e)}")
            
            # Now properly decode with validation
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            logger.debug(f"Token decoded successfully: {payload}")
            
            user_id = payload.get('user_id')
            if not user_id:
                return JsonResponse({'error': 'Invalid token payload'}, status=401)
                
            # Get the user from database
            user_dict = UserManager.get_user_by_id(user_id)
            if not user_dict:
                return JsonResponse({'error': 'User not found'}, status=401)
                
            # Convert dict to CustomUser object and set on request
            request.user = CustomUser(user_dict)
            return None
            
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token has expired'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=401)
        except Exception as e:
            # Log the error in production
            return JsonResponse({'error': 'An error occurred during authentication'}, status=500) 