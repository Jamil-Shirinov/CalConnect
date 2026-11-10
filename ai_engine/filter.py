def pre_filter_tutors(student, all_tutors, max_candidates=5, budget_tolerance=1.5):
    """
    Filters a list of tutors based on hard constraints (subject match and budget limit)
    before sending them to the LLM for deep analysis.
    """
    filtered_tutors = []
    
    student_subject = student.get("subject", "").strip().lower()
    student_budget = student.get("budget_per_hour", 0)
    
    # Calculate the maximum allowable hourly rate
    max_allowed_rate = student_budget * budget_tolerance
    
    for tutor in all_tutors:
        # 1. Check if the subject matches
        tutor_subject = tutor.get("subject", "").strip().lower()
        if student_subject != tutor_subject:
            continue
            
        # 2. Check if the price is within the acceptable tolerance
        tutor_rate = tutor.get("hourly_rate", float('inf'))
        if tutor_rate > max_allowed_rate:
            continue
            
        filtered_tutors.append(tutor)
        
    # Sort by price (closest to student's budget) to prioritize best economical matches
    filtered_tutors.sort(key=lambda t: abs(t.get("hourly_rate", 0) - student_budget))
    
    # Return only the top N candidates to save LLM tokens
    return filtered_tutors[:max_candidates]