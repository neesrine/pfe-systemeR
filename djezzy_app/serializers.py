from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import (
    Candidat, Langue, Domaine, Specialite, Competence,
    Formation, Experience, Offre, Candidature, Region,
    Entretien, Departement
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']

class LangueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Langue
        fields = '__all__'

class DomaineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domaine
        fields = '__all__'

class SpecialiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialite
        fields = '__all__'

class CompetenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Competence
        fields = '__all__'

class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = '__all__'

class FormationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formation
        fields = '__all__'
        read_only_fields = ['candidat']

class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = '__all__'
        read_only_fields = ['candidat']

class OffreSerializer(serializers.ModelSerializer):
    a_postule = serializers.BooleanField(read_only=True, required=False)
    
    class Meta:
        model = Offre
        fields = '__all__'

class CandidatureSerializer(serializers.ModelSerializer):
    candidat_nom = serializers.SerializerMethodField()
    offre_titre = serializers.SerializerMethodField()
    
    class Meta:
        model = Candidature
        fields = '__all__'
        read_only_fields = ['candidat', 'date_postulation']
    
    def get_candidat_nom(self, obj):
        # Renvoie le nom complet du candidat
        if obj.candidat and obj.candidat.user:
            return f"{obj.candidat.user.first_name} {obj.candidat.user.last_name}"
        return "Non spécifié"
    
    def get_offre_titre(self, obj):
        # Renvoie le titre de l'offre
        if obj.offre:
            return obj.offre.titre
        return "Non spécifié"

class CandidatSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Candidat
        fields = '__all__'
        read_only_fields = ['user']

class CandidatDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    formations = FormationSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    langues = LangueSerializer(many=True, read_only=True)
    competences = CompetenceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Candidat
        fields = '__all__'
        read_only_fields = ['user']

class RegisterCandidatSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    date_naissance = serializers.DateField(required=True)
    
    class Meta:
        model = Candidat
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 
                 'date_naissance', 'telephone', 'adresse', 'cv']
        extra_kwargs = {
            'telephone': {'required': True},
            'adresse': {'required': True},
            'cv': {'required': False}
        }
    
    def validate(self, attrs):
        # Vérification que les mots de passe correspondent
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        
        # Vérification que l'email n'est pas déjà utilisé
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Un utilisateur avec cet email existe déjà."})
        
        # Vérification que le nom d'utilisateur n'est pas déjà utilisé
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "Ce nom d'utilisateur est déjà pris."})
        
        return attrs
    
    def create(self, validated_data):
        # Supprime le champ password2 car nous n'en avons pas besoin pour la création
        password2 = validated_data.pop('password2')
        
        # Extraction des données spécifiques au User
        user_data = {
            'username': validated_data.pop('username'),
            'email': validated_data.pop('email'),
            'first_name': validated_data.pop('first_name'),
            'last_name': validated_data.pop('last_name'),
            'password': validated_data.pop('password')
        }
        
        # Création de l'utilisateur
        user = User.objects.create_user(**user_data)
        
        # Création du candidat associé
        candidat = Candidat.objects.create(user=user, **validated_data)
        
        return candidat

class UpdateCandidatProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    
    class Meta:
        model = Candidat
        fields = ['first_name', 'last_name', 'email', 'telephone', 'adresse', 'cv', 'date_naissance']
        read_only_fields = ['user']
    
    def update(self, instance, validated_data):
        # Mise à jour des champs utilisateur si fournis
        user_data = validated_data.pop('user', {})
        user = instance.user
        
        if 'first_name' in user_data:
            user.first_name = user_data['first_name']
        if 'last_name' in user_data:
            user.last_name = user_data['last_name']
        if 'email' in user_data:
            # Vérifier si l'email est déjà utilisé par un autre utilisateur
            if User.objects.exclude(id=user.id).filter(email=user_data['email']).exists():
                raise serializers.ValidationError({"email": "Un utilisateur avec cet email existe déjà."})
            user.email = user_data['email']
        
        user.save()
        
        # Mise à jour des champs du candidat
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class EntretienSerializer(serializers.ModelSerializer):
    class Meta:
        model = Entretien
        fields = '__all__'

class DepartementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departement
        fields = '__all__'



from .models import CandidatLangue

class CandidatLangueSerializer(serializers.ModelSerializer):
    candidat = serializers.StringRelatedField()
    langue = serializers.StringRelatedField()
    niveau_display = serializers.CharField(source='get_niveau_display', read_only=True)

    class Meta:
        model = CandidatLangue
        fields = ['id', 'candidat', 'langue', 'niveau', 'niveau_display']