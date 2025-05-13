from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    """
    Permission personnalisée qui permet uniquement aux administrateurs d'effectuer certaines actions.
    """

    def has_permission(self, request, view):
        # Vérifie si l'utilisateur est authentifié et est un administrateur
        return request.user.is_authenticated and request.user.is_staff


class IsCandidat(BasePermission):
    """
    Permission personnalisée qui permet uniquement aux candidats d'effectuer certaines actions.
    """
    def has_permission(self, request, view):
        # Vérifie si l'utilisateur est authentifié et a un profil candidat
        return request.user.is_authenticated and hasattr(request.user, 'candidat')