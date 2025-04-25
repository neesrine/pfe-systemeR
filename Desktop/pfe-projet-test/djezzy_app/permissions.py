# permissions.py

from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    """
    Permission personnalisée qui permet uniquement aux administrateurs d'effectuer certaines actions.
    """

    def has_permission(self, request, view):
        # Vérifie si l'utilisateur est un administrateur
        return request.user and request.user.is_staff  # Si l'utilisateur est un admin (is_staff = True)


class IsCandidat(BasePermission):
    """
    Permission personnalisée qui permet uniquement aux candidats d'effectuer certaines actions.
    """
    def has_permission(self, request, view):
        # Vérifie si l'utilisateur a un profil candidat
        return request.user and hasattr(request.user, 'candidat')