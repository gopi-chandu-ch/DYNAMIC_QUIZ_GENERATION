from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Course, Quiz
from collections import defaultdict
import random
from gensim.models import Word2Vec
import os


@api_view(['GET'])
def home(request):
    """Return all courses"""
    courses = Course.objects.all().values('id', 'name', 'description')
    return Response({'courses': list(courses)})


@api_view(['GET'])
def start_quiz(request, course_id):
    """Start quiz by selecting questions"""
    course = get_object_or_404(Course, id=course_id)
    all_quizzes = list(course.quizzes.all())

    if not all_quizzes:
        return Response({'message': 'No questions available for this course'}, status=404)

    topic_groups = defaultdict(list)
    for q in all_quizzes:
        topic = q.topic or "General"
        topic_groups[topic].append(q)

    TOTAL_QUESTIONS = min(10, len(all_quizzes))
    topics = list(topic_groups.keys())
    per_topic = max(1, TOTAL_QUESTIONS // len(topics))

    selected_quizzes = []
    for topic in topics:
        questions = topic_groups[topic]
        random.shuffle(questions)
        selected_quizzes.extend(questions[:per_topic])

    if len(selected_quizzes) < TOTAL_QUESTIONS:
        remaining = [q for q in all_quizzes if q not in selected_quizzes]
        random.shuffle(remaining)
        selected_quizzes.extend(remaining[:TOTAL_QUESTIONS - len(selected_quizzes)])

    random.shuffle(selected_quizzes)

    data = [
        {
            "id": q.id,
            "question": q.question,
            "option1": q.option1,
            "option2": q.option2,
            "option3": q.option3,
            "option4": q.option4,
            "correct_answer": q.correct_answer,
            "topic": q.topic,
        }
        for q in selected_quizzes
    ]

    return Response({"course": course.name, "quizzes": data})


@api_view(['POST'])
def submit_quiz(request):
    """Receive answers from React and calculate score"""
    answers = request.data.get('answers', [])
    course_id = request.data.get('course_id')

    course = get_object_or_404(Course, id=course_id)
    score = 0
    wrong_topics = {}

    for ans in answers:
        quiz = get_object_or_404(Quiz, id=ans['id'])
        if ans['selected'] == quiz.correct_answer:
            score += 1
        else:
            topic = quiz.topic or "General"
            wrong_topics[topic] = wrong_topics.get(topic, 0) + 1

    next_quiz_ids = generate_next_quiz(course, wrong_topics)

    return Response({
        "score": score,
        "total": len(answers),
        "wrong_topics": wrong_topics,
        "next_quiz_ids": next_quiz_ids
    })


def generate_next_quiz(course, wrong_topics):
    """Uses Word2Vec to suggest next quiz topics"""
    all_quizzes = list(course.quizzes.all())
    all_topics = [q.topic or "General" for q in all_quizzes]

    if not all_topics:
        return []

    sentences = [[topic] for topic in all_topics]
    model_path = f"word2vec_course_{course.id}.model"

    if not os.path.exists(model_path):
        model = Word2Vec(sentences, vector_size=50, window=2, min_count=1, sg=1)
        model.save(model_path)
    else:
        model = Word2Vec.load(model_path)

    strong_topics = list(set(all_topics) - set(wrong_topics.keys()))

    similar_topics = []
    for topic in strong_topics:
        if topic in model.wv:
            try:
                similar = model.wv.most_similar(topic, topn=2)
                similar_topics.extend([t for t, _ in similar])
            except KeyError:
                continue

    next_topics = list(set(strong_topics + similar_topics))
    next_quizzes = [q for q in all_quizzes if q.topic in next_topics]
    random.shuffle(next_quizzes)

    return [q.id for q in next_quizzes[:10]]

@api_view(['POST'])
def get_questions_by_ids(request):
    """Return quiz questions by given IDs"""
    ids = request.data.get('ids', [])
    quizzes = Quiz.objects.filter(id__in=ids)
    data = [
        {
            "id": q.id,
            "question": q.question,
            "option1": q.option1,
            "option2": q.option2,
            "option3": q.option3,
            "option4": q.option4,
            "correct_answer": q.correct_answer,
        }
        for q in quizzes
    ]
    return Response(data)

