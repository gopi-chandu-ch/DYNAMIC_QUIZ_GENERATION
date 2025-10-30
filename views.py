from django.shortcuts import render, redirect, get_object_or_404
from .models import Course, Quiz
from collections import defaultdict
import random


def home(request):
    courses = Course.objects.all()
    return render(request, 'home.html', {'courses': courses})


def start_quiz(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    all_quizzes = list(course.quizzes.all())

    if not all_quizzes:
        return render(request, 'no_questions.html', {'course': course})

    #  Group questions by topic
    topic_groups = defaultdict(list)
    for q in all_quizzes:
        topic = q.topic or "General"
        topic_groups[topic].append(q)

    #  Total number of questions per quiz
    TOTAL_QUESTIONS = min(10, len(all_quizzes))  # limit to 10 or less if fewer exist

    #  Step 1: pick questions evenly across all topics
    topics = list(topic_groups.keys())
    per_topic = max(1, TOTAL_QUESTIONS // len(topics))  # at least one question per topic

    selected_quizzes = []

    for topic in topics:
        questions = topic_groups[topic]
        random.shuffle(questions)
        selected_quizzes.extend(questions[:per_topic])

    #  Step 2: if still under limit, fill remaining randomly
    if len(selected_quizzes) < TOTAL_QUESTIONS:
        remaining = [q for q in all_quizzes if q not in selected_quizzes]
        random.shuffle(remaining)
        selected_quizzes.extend(remaining[:TOTAL_QUESTIONS - len(selected_quizzes)])

    #  Step 3: shuffle final selection
    random.shuffle(selected_quizzes)

    #  Store shuffled question IDs in session
    request.session['quiz_ids'] = [q.id for q in selected_quizzes]
    request.session['course_id'] = course.id
    request.session['q_index'] = 0
    request.session['score'] = 0
    request.session['wrong_topics'] = {}

    return redirect('quiz_question')


def quiz_question(request):
    course_id = request.session.get('course_id')
    course = get_object_or_404(Course, id=course_id)
    quiz_ids = request.session.get('quiz_ids', [])
    q_index = request.session.get('q_index', 0)

    # No more questions → go to result page
    if q_index >= len(quiz_ids):
        return redirect('result')

    #  Get current question using stored ID order
    question = get_object_or_404(Quiz, id=quiz_ids[q_index])

    if request.method == 'POST':
        selected = request.POST.get('answer')

        if selected == question.correct_answer:
            request.session['score'] += 1
        else:
            wrong_topics = request.session.get('wrong_topics', {})
            topic = question.topic or "General"
            wrong_topics[topic] = wrong_topics.get(topic, 0) + 1
            request.session['wrong_topics'] = wrong_topics

        request.session['q_index'] += 1
        return redirect('quiz_question')

    return render(request, 'quiz.html', {'question': question, 'course': course})


def quiz_result(request):
    course_id = request.session.get('course_id')
    course = get_object_or_404(Course, id=course_id)

    score = request.session.get('score', 0)
    total = len(request.session.get('quiz_ids', []))  # Only count selected questions
    wrong_topics = request.session.get('wrong_topics', {})

    #  Identify weakest topic
    if wrong_topics:
        weakest_topic = max(wrong_topics, key=wrong_topics.get)
    else:
        weakest_topic = "None  (Excellent performance!)"

    return render(request, 'result.html', {
        'score': score,
        'total': total,
        'course': course,
        'wrong_topics': wrong_topics,
        'weakest_topic': weakest_topic
    })
