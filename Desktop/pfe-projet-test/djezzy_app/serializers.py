from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import (
    Candidat, Langue, Domaine, Specialite, Competence, Formation, 
    Experience, Offre, Candidature, Region, Admin
)


class CandidatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidat
        fields = '__all__'

    def create(self, validated_data):
        """Créer un nouveau candidat."""
        # Créer le candidat
        candidat = Candidat.objects.create(**validated_data)
        return candidat

    def update(self, instance, validated_data):
        """Mettre à jour un candidat existant."""
        # Mettre à jour les informations du candidat
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class LangueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Langue
        fields = ['id', 'nom']


class DomaineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domaine
        fields = ['id', 'nom']


class SpecialiteSerializer(serializers.ModelSerializer):
    domaine = DomaineSerializer()

    class Meta:
        model = Specialite
        fields = ['id', 'nom', 'domaine']


class CompetenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Competence
        fields = ['id', 'nom']


class FormationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formation
        fields = ['id', 'titre', 'etablissement', 'date_debut', 'date_fin', 'candidat']


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['id', 'entreprise', 'poste', 'date_debut', 'date_fin', 'candidat']


class OffreSerializer(serializers.ModelSerializer):
    region = serializers.PrimaryKeyRelatedField(queryset=Region.objects.all(), required=False)

    class Meta:
        model = Offre
        fields = ['id_offre', 'titre', 'description', 'date_creation', 'region', 'admin']

    def create(self, validated_data):
        """
        Lors de la création d'une offre, on associe automatiquement la région de l'admin connecté.
        """
        user = self.context['request'].user
        admin = user.admin  # L'admin associé à l'utilisateur
        region = admin.region  # Récupère la région de l'admin
        validated_data['region'] = region
        return super().create(validated_data)


from rest_framework import serializers
from .models import Candidature, Candidat, Offre
from .serializers import CandidatSerializer, OffreSerializer

class CandidatureSerializer(serializers.ModelSerializer):
    candidat = serializers.PrimaryKeyRelatedField(queryset=Candidat.objects.all())  # Accepte un ID pour le candidat
    offre = serializers.PrimaryKeyRelatedField(queryset=Offre.objects.all())  # Accepte un ID pour l'offre
    date_postulation = serializers.DateField(read_only=True)  # Date de postulation en lecture seule
    statut = serializers.ChoiceField(choices=Candidature.STATUT_CHOICES)

    class Meta:
        model = Candidature
        fields = ['id', 'candidat', 'offre', 'date_postulation', 'statut']

    def update(self, instance, validated_data):
        """
        Mise à jour du statut d'une candidature. Validation du statut.
        """
        statut = validated_data.get('statut', instance.statut)
        if statut not in ['en_attente', 'accepte', 'refuse']:
            raise serializers.ValidationError('Statut invalide')
        instance.statut = statut
        instance.save()
        return instance

from .models import Admin
class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = '__all__'  # Ou s

class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = ['id', 'nom']


# Serializers pour l'inscription et la connexion
# serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Candidat
class RegisterCandidatSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField()
    nom = serializers.CharField()
    prenom = serializers.CharField()
    sexe = serializers.CharField()
    date_naissance = serializers.DateField()
    telephone = serializers.CharField()
    profession = serializers.CharField()
    description = serializers.CharField()

    def create(self, validated_data):
        User = get_user_model()

        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email']
        )

        candidat = Candidat.objects.create(
            user=user,
            nom=validated_data['nom'],
            prenom=validated_data['prenom'],
            sexe=validated_data['sexe'],
            email=validated_data['email'],
            password=validated_data['password'],
            date_naissance=validated_data['date_naissance'],
            telephone=validated_data['telephone'],
            profession=validated_data['profession'],
            description=validated_data['description']
        )

        return candidat




class LoginCandidatSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


from rest_framework import serializers
from .models import Entretien, Departement

class EntretienSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entretien
        fields = '__all__'

class DepartementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departement
        fields = '__all__'
