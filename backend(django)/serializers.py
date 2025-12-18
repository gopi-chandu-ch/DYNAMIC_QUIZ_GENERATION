from rest_framework import serializers
from .models import Course, Quiz

class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'question', 'option1', 'option2', 'option3', 'option4', 'correct_answer', 'topic']

class CourseSerializer(serializers.ModelSerializer):
    quizzes = QuizSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'name', 'description', 'quizzes']
