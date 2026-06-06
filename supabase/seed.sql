-- CareLink NDIS Platform — Seed Data
-- All data is entirely fictional and for demo purposes only.
-- Run AFTER schema.sql and after creating the auth users below.

-- ============================================================
-- STEP 1: Create auth users via Supabase dashboard or CLI:
--   supabase auth add-user jordan@carelink.demo Demo1234!
--   supabase auth add-user sam@carelink.demo Demo1234!
--   supabase auth add-user aisha@carelink.demo Demo1234!
--   supabase auth add-user marcus@carelink.demo Demo1234!
--   supabase auth add-user priya@carelink.demo Demo1234!
--
-- Then replace the UUIDs below with the actual auth.users IDs.
-- ============================================================

-- Placeholder UUIDs (replace with real auth.users IDs after creating accounts)
do $$
declare
  -- Worker IDs (replace after auth user creation)
  jordan_id uuid := '116d01be-ba26-40e4-ad96-6c8a8262b484';
  sam_id    uuid := 'a984c403-6b65-42d1-ba12-62608128caff';
  -- Participant IDs (replace after auth user creation)
  aisha_auth_id  uuid := '09de9dc9-7f89-4201-8e6c-ccb8c0074dbd';
  marcus_auth_id uuid := 'f246d94b-ecea-4102-9eeb-252b5b510725';
  priya_auth_id  uuid := 'd9ebebf7-15fb-4ad6-bca5-779117223f39';

  -- Participant record IDs (generated)
  aisha_p_id  uuid := gen_random_uuid();
  marcus_p_id uuid := gen_random_uuid();
  priya_p_id  uuid := gen_random_uuid();

begin

-- ============================================================
-- PROFILES
-- ============================================================
insert into public.profiles (id, full_name, role, worker_screening_check) values
  (jordan_id, 'Jordan Mitchell', 'worker', 'WSC-4821937650'),
  (sam_id,    'Sam Chen',       'worker', 'WSC-7734821093');

insert into public.profiles (id, full_name, role, ndis_number) values
  (aisha_auth_id,  'Aisha Nguyen',  'participant', '4301928374'),
  (marcus_auth_id, 'Marcus Okafor', 'participant', '4387654321'),
  (priya_auth_id,  'Priya Sharma',  'participant', '4312876543');

-- ============================================================
-- PARTICIPANTS — Aisha Nguyen
-- ============================================================
insert into public.participants (id, profile_id, preferred_name, date_of_birth, primary_disability, secondary_disabilities, communication_profile, pronoun, profile_photo_url) values
  (aisha_p_id, aisha_auth_id, 'Aisha', '1990-03-14',
   'Autism Spectrum Disorder (Level 2)',
   array['Epilepsy (tonic-clonic seizures)', 'Anxiety disorder'],
   'Aisha uses a high-tech AAC device (Proloquo2Go on iPad) as her primary communication method. She communicates using pre-programmed phrases and symbols. Always give her time to formulate a response — do not rush or speak for her. She understands spoken language well but may not always respond verbally. Preferred communication: AAC device → pointing → yes/no questions. Use clear, simple sentences. Avoid metaphors and sarcasm.',
   'she/her',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=AishaNguyen'
  );

-- Support Manuals — Aisha
insert into public.support_manuals (participant_id, title, content, category, is_critical) values
  (aisha_p_id, 'Seizure Safety Protocol',
   'Aisha experiences tonic-clonic seizures, typically lasting 1–3 minutes. Warning signs include staring, lip smacking, and fidgeting with her AAC device. Post-seizure she will be confused and fatigued for up to 30 minutes (postictal phase).

DURING a seizure: Do NOT restrain her. Move furniture away. Place her on her side if possible. Time the seizure. Call 000 if seizure exceeds 5 minutes or she does not regain consciousness.',
   'general', true),

  (aisha_p_id, 'Daily Routine',
   'Morning (7:00–9:00am):
- Wake at 7:00am with a verbal greeting and gentle light
- Personal hygiene: Aisha can brush teeth and wash face independently. Assist with hair styling if requested via AAC
- Dress: Prefers loose-fitting, sensory-friendly clothing. Avoid tags — she has had her clothing pre-cut. Seams on socks must face outward
- Breakfast: Offer two choices using AAC. Usually requests Weet-Bix with warm milk or toast with Vegemite

Afternoon:
- Rest period 1:00–2:00pm is important for seizure management
- Preferred activities: AAC-assisted drawing, YouTube music videos (Vietnamese pop), quiet puzzles

Evening:
- Dinner at 6:00pm
- Wind-down routine starts at 8:00pm — dim lights, reduce noise
- In bed by 9:00pm. Sleep is critical for epilepsy management.',
   'daily_routine', false),

  (aisha_p_id, 'Mobility and Sensory Needs',
   'Aisha ambulates independently. No mobility aids required.

Sensory profile:
- Hypersensitive to loud/sudden sounds — use noise-cancelling headphones if environments are noisy
- Hypersensitive to bright/flickering lights — avoid fluorescent lighting where possible
- Seeks proprioceptive input: weighted blanket during rest, may want to rock or pace
- Touch: Ask before touching. Approach from the front.

Community access:
- Prefers familiar routes. Introduce new locations gradually.
- Always carry AAC device when leaving the house.
- She knows her address and phone number.',
   'mobility', false);

-- Incidents — Aisha
insert into public.incident_types (participant_id, name, description, response_steps, when_to_call_000, when_to_call_support_coordinator, notes) values
  (aisha_p_id, 'Tonic-Clonic Seizure',
   'Aisha loses consciousness and experiences rhythmic jerking of arms and legs. May cry out at onset. Face may turn blue briefly. Will be confused and drowsy afterward.',
   array[
     'Stay calm. Note the time the seizure started.',
     'Clear the area — move furniture and hard objects away from Aisha.',
     'Do NOT restrain her. Do NOT put anything in her mouth.',
     'Gently guide her to the floor if she is not already there. Place something soft under her head.',
     'Turn her onto her side (recovery position) once convulsions stop.',
     'Stay with her until she is fully conscious and oriented.',
     'Call 000 immediately if: seizure lasts more than 5 minutes, she does not regain consciousness, she has another seizure without recovering, she is injured, or she is having difficulty breathing.',
     'Document: time started, duration, what you observed. Contact support coordinator and family.'
   ],
   true, true, 'Aisha''s last seizure was 6 weeks ago. She is on sodium valproate — do not skip doses.'),

  (aisha_p_id, 'Meltdown / Sensory Overload',
   'Aisha becomes overwhelmed by sensory input. Signs: increased stimming, covering ears, dropping AAC device, withdrawal, rocking intensively, or crying without apparent cause.',
   array[
     'Speak calmly and quietly. Lower your own voice and slow your speech.',
     'Reduce sensory input immediately: turn off music, dim lights, move to a quieter space if possible.',
     'Do not ask questions or demand communication during meltdown.',
     'Offer weighted blanket or familiar comfort object (blue stuffed elephant, in her bag).',
     'Give space — stay nearby but do not crowd her.',
     'Once calm (may take 20–40 minutes), offer water and rest. Use AAC for check-in.',
     'Document triggers if identifiable. Report to support coordinator if meltdowns are increasing in frequency.'
   ],
   false, true, 'Common triggers: unexpected schedule changes, loud environments, hunger, fatigue, and missing AAC device.');

-- Dietary — Aisha
insert into public.dietary_requirements (participant_id, requirement_type, description, severity, notes) values
  (aisha_p_id, 'allergy', 'Tree nuts (cashews, almonds, walnuts, pistachios)', 'life_threatening', 'Carries EpiPen. Keep in reach at all times. Check all packaged foods for "may contain tree nuts".'),
  (aisha_p_id, 'medical', 'Ketogenic-adjacent diet considerations', 'serious', 'Neurologist recommends low-sugar diet to support seizure management. Avoid high-GI foods, excessive sugar, and energy drinks.'),
  (aisha_p_id, 'preference', 'Dislikes strong spices and curry', 'preference', 'Sensory sensitivity to strong smells. Prefers mild flavours.');

-- Emergency Contacts — Aisha
insert into public.emergency_contacts (participant_id, full_name, relationship, phone_primary, phone_secondary, is_primary_contact, notes) values
  (aisha_p_id, 'Linh Nguyen', 'Mother', '0412 345 678', '(03) 9123 4567', true, 'Vietnamese-speaking. Speaks good English. Best reached after 5pm on weekdays.'),
  (aisha_p_id, 'Thanh Nguyen', 'Father', '0423 456 789', null, false, null),
  (aisha_p_id, 'Dr Sarah Obi', 'Neurologist (Epilepsy)', '(03) 9876 5432', null, false, 'Royal Melbourne Hospital Epilepsy Clinic. Call for seizure concerns.');

-- Medical Info — Aisha
insert into public.medical_info (participant_id, gp_name, gp_phone, specialist_name, specialist_phone, medications, diagnoses, medicare_number, health_insurance) values
  (aisha_p_id, 'Dr James Patel', '(03) 9321 1234', 'Dr Sarah Obi (Neurologist)', '(03) 9876 5432',
   '[
     {"name": "Sodium Valproate (Epilim)", "dose": "500mg", "frequency": "twice daily with food", "notes": "Critical — do not miss doses. Levels checked every 6 months."},
     {"name": "Melatonin", "dose": "3mg", "frequency": "30 minutes before bed", "notes": "For sleep support"},
     {"name": "EpiPen (Adrenaline)", "dose": "0.3mg auto-injector", "frequency": "Emergency use only — tree nut anaphylaxis", "notes": "Always on person. Check expiry monthly."}
   ]',
   '[
     {"condition": "Autism Spectrum Disorder (Level 2)", "diagnosed_date": "2003-04-01", "notes": "Diagnosed age 13. Uses AAC for primary communication."},
     {"condition": "Generalised Epilepsy — Tonic-clonic seizures", "diagnosed_date": "2015-08-15", "notes": "Well-controlled on sodium valproate. Last seizure 6 weeks ago."},
     {"condition": "Anxiety Disorder", "diagnosed_date": "2018-01-01", "notes": "Managed through routine, BSP strategies, and occupational therapy."}
   ]',
   '2345 67890 1', 'Medibank Private — Hospital and Extras');

-- BSP — Aisha
insert into public.behaviour_support_plans (participant_id, title, summary, triggers, de_escalation_strategies, last_reviewed, reviewed_by) values
  (aisha_p_id, 'Aisha Nguyen — Behaviour Support Plan v3.2',
   'Aisha presents with anxiety-based behaviours including refusal, withdrawal, and sensory meltdowns when routines are disrupted or environments become overwhelming. Her behaviour is communicative — it indicates unmet sensory or emotional needs. The goal is prevention through routine and sensory accommodation, not suppression of behaviour.',
   array[
     'Unexpected changes to daily routine or schedule',
     'Loud, crowded, or brightly lit environments',
     'Being touched without warning',
     'Hunger or fatigue (especially in the afternoon)',
     'Losing access to AAC device',
     'Being rushed or spoken to too quickly',
     'Conflict between people near her'
   ],
   array[
     'Use a calm, quiet voice. Match Aisha''s energy — slow down your own movements.',
     'Reduce environmental input: lower lights, reduce noise, move to familiar space.',
     'Do not make demands. Remove expectations temporarily.',
     'Offer weighted blanket and blue stuffed elephant from bag.',
     'Allow stimming behaviours without interruption — they are self-regulatory.',
     'Use visual schedule to show "what happens next" once calm begins.',
     'Offer water, snack if appropriate. Quiet co-regulation — sit nearby, say nothing.',
     'After recovery: brief, supportive AAC check-in. Do not debrief at length.'
   ],
   '2025-11-10', 'Dr Maria Santos (Behaviour Support Practitioner)');

-- ============================================================
-- PARTICIPANTS — Marcus Okafor
-- ============================================================
insert into public.participants (id, profile_id, preferred_name, date_of_birth, primary_disability, secondary_disabilities, communication_profile, pronoun, profile_photo_url) values
  (marcus_p_id, marcus_auth_id, 'Marcus', '2002-07-22',
   'Cerebral Palsy — Spastic Diplegia',
   array['Chronic pain (lower back and hip flexors)', 'Mild learning disability'],
   'Marcus communicates verbally and is highly articulate. He enjoys conversation and humour. Speak directly to him — do not speak to a carer as if he is not present. He is aware of and frustrated by infantilising behaviour. He uses a power wheelchair (Permobil M3) for all mobility. He can eat and drink independently with adaptive cutlery. He manages his phone and computer independently with head-switch input.',
   'he/him',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=MarcusOkafor'
  );

-- Support Manuals — Marcus
insert into public.support_manuals (participant_id, title, content, category, is_critical) values
  (marcus_p_id, 'Power Wheelchair Operation',
   'Marcus''s power wheelchair is a Permobil M3. He operates it fully independently using a joystick controller.

Your responsibilities:
- Ensure wheelchair is charged at start and end of shift (charger is in the hallway cupboard)
- Check tyre pressure weekly — there is a gauge in the equipment box
- Do NOT push the wheelchair without Marcus''s permission — it overrides his control
- Ramp access: the front door has a portable ramp (stored beside door). Angle must not exceed 1:8.
- If wheelchair malfunctions: emergency contact is Permobil service line 1800 737 664

In the community: Marcus navigates independently. Walk beside him, not ahead.',
   'mobility', true),

  (marcus_p_id, 'Daily Routine',
   'Morning (8:00–10:00am):
- Marcus wakes independently at 8am. Knock and wait for verbal confirmation before entering.
- Personal care: Shower (shower wheelchair required — model in bathroom). Marcus directs all personal care. Ask "what would you like me to do?" not "shall I do X?". He will instruct.
- Dress: He selects his own clothing. Support with lower body dressing as needed — he has limited hip flexion.
- Breakfast: Full verbal communication. He makes his own choices. Adaptive cutlery in top drawer.

Daytime:
- Marcus attends TAFE on Tuesday and Thursday (10am–2pm). Assist with transport booking if needed.
- On other days he works on his music production (laptop, head-switch + eye gaze).
- Do not disturb during music sessions without knocking first.

Evening:
- Dinner: Marcus can microwave meals independently. Assist with meal prep if requested.
- In-bed transfer at 9:30pm — follow manual handling protocol (see pink binder on shelf).',
   'daily_routine', false),

  (marcus_p_id, 'Pain Management and Positioning',
   'Marcus experiences chronic pain in his lower back and hip flexors as a result of spasticity and prolonged sitting.

Positioning guidelines:
- Repositioning every 2 hours is required when Marcus is in bed or seated for extended periods
- Use the positioning wedges in the linen cupboard for side-lying
- If Marcus reports pain rating >6/10, offer repositioning, heat pack (red pack in freezer), or contact GP

Do NOT:
- Perform passive stretches unless directed by physio
- Use non-prescribed equipment
- Dismiss pain reports — Marcus is often stoic and rarely complains

Physiotherapy: Thursdays fortnightly at 2pm with Marcus Thomas (Physio). Assist with transport.',
   'personal_care', false);

-- Incidents — Marcus
insert into public.incident_types (participant_id, name, description, response_steps, when_to_call_000, when_to_call_support_coordinator, notes) values
  (marcus_p_id, 'Autonomic Dysreflexia',
   'A potentially life-threatening condition triggered by a stimulus below the level of injury (e.g. full bladder, pressure sore, tight clothing). Signs: sudden severe headache, flushing/sweating above the waist, blotchy skin, elevated blood pressure, slow heart rate, anxiety.',
   array[
     'This is a medical emergency. Stay calm.',
     'Sit Marcus upright immediately (if lying down, raise head of bed to 90 degrees).',
     'Call 000 and state: "I believe my client is experiencing autonomic dysreflexia."',
     'Loosen or remove any tight clothing, restraints, or constrictions below waist.',
     'Check for and relieve the most common cause: a blocked or kinked catheter tube. If catheter is blocked, attempt to flush with 30mL sterile water.',
     'Check for pressure sores, tight shoes, or any other pain stimulus below the waist.',
     'Monitor blood pressure if BP cuff is available. Normal for Marcus is 110/70.',
     'Do not leave Marcus alone. Stay on the line with 000 and document all observations.'
   ],
   true, true, 'Marcus does not have a current catheter but if this changes, update this protocol.'),

  (marcus_p_id, 'Pressure Injury (Stage 1–2)',
   'Redness, warmth, or breakdown of skin, particularly over bony prominences (sacrum, heels, ischial tuberosities). Marcus may not always feel pressure injuries due to altered sensation.',
   array[
     'Inspect skin at each shift — document any new areas of redness or skin changes.',
     'If redness is present: relieve pressure immediately by repositioning.',
     'Do NOT massage red areas — this can worsen damage.',
     'If skin is broken: cover with a non-stick dressing from the first aid kit. Do not use adhesive dressings on fragile skin.',
     'Document with photo (with Marcus''s consent) and report to support coordinator and GP within 24 hours.',
     'Review seating and repositioning schedule — increase frequency if injury is present.'
   ],
   false, true, 'Marcus is at moderate risk due to prolonged sitting. Daily skin checks are mandatory.');

-- Dietary — Marcus
insert into public.dietary_requirements (participant_id, requirement_type, description, severity, notes) values
  (marcus_p_id, 'medical', 'High protein diet for muscle health and spasticity management', 'mild', 'Aim for protein at each meal. Lean meats, legumes, eggs, dairy.'),
  (marcus_p_id, 'preference', 'Vegetarian on Fridays (religious practice)', 'preference', 'Nigerian Igbo Catholic tradition. Does not eat meat on Fridays.'),
  (marcus_p_id, 'intolerance', 'Lactose intolerance — mild', 'mild', 'Avoid large amounts of dairy. Lactase tablets in medicine cabinet if needed. Oat milk in fridge.');

-- Emergency Contacts — Marcus
insert into public.emergency_contacts (participant_id, full_name, relationship, phone_primary, phone_secondary, is_primary_contact, notes) values
  (marcus_p_id, 'Chioma Okafor', 'Mother', '0411 222 333', '(02) 8765 4321', true, 'Very involved. Prefers to be called for any incidents regardless of hour.'),
  (marcus_p_id, 'Emmanuel Okafor', 'Father', '0422 333 444', null, false, 'Works offshore — not always reachable. Try mother first.'),
  (marcus_p_id, 'Marcus Thomas', 'Physiotherapist', '(02) 9234 5678', null, false, 'Call for musculoskeletal concerns. Can advise on positioning remotely.');

-- Medical Info — Marcus
insert into public.medical_info (participant_id, gp_name, gp_phone, specialist_name, specialist_phone, medications, diagnoses, medicare_number, health_insurance) values
  (marcus_p_id, 'Dr Amara Diallo', '(02) 9111 2222', 'Dr Kevin Lim (Rehabilitation Physician)', '(02) 9345 6789',
   '[
     {"name": "Baclofen", "dose": "20mg", "frequency": "three times daily", "notes": "Antispasticity medication. Do not stop suddenly — risk of withdrawal seizures."},
     {"name": "Ibuprofen", "dose": "400mg", "frequency": "as needed for pain (max 3x daily)", "notes": "Take with food. Marcus self-manages this."},
     {"name": "Vitamin D", "dose": "1000IU", "frequency": "daily", "notes": "Bone health support."}
   ]',
   '[
     {"condition": "Cerebral Palsy — Spastic Diplegia", "diagnosed_date": "2002-09-01", "notes": "Full-time power wheelchair user. Predominantly affects lower limbs."},
     {"condition": "Chronic musculoskeletal pain", "diagnosed_date": "2018-01-01", "notes": "Lower back and hip flexors. Managed with physio, baclofen, and positioning."},
     {"condition": "Mild learning disability", "diagnosed_date": "2005-06-01", "notes": "Affects processing speed. Does not affect verbal communication or decision-making capacity."}
   ]',
   '3456 78901 2', 'HCF — Comprehensive');

-- BSP — Marcus
insert into public.behaviour_support_plans (participant_id, title, summary, triggers, de_escalation_strategies, last_reviewed, reviewed_by) values
  (marcus_p_id, 'Marcus Okafor — Positive Behaviour Support Plan v1.1',
   'Marcus does not present with challenging behaviours. This plan documents his communication preferences and strategies for when he is frustrated or in pain, to ensure his autonomy is respected and his voice is centred in his own care.',
   array[
     'Being spoken over or ignored during interactions',
     'Support workers taking over tasks he can do himself',
     'Delays to routine without explanation',
     'Unacknowledged or dismissed pain reports',
     'Loss of internet or technology access for extended periods'
   ],
   array[
     'Listen without interrupting. Marcus is articulate — give him space to express himself fully.',
     'Acknowledge his frustration directly: "I can see that was frustrating. I''m sorry."',
     'Ask what he needs: "What would be most helpful right now?"',
     'If pain is involved, offer repositioning, heat pack, or to contact the GP.',
     'Do not attempt to problem-solve until he has finished expressing himself.',
     'Give him control: offer choices rather than directives.'
   ],
   '2026-01-15', 'Zoe Park (Support Coordinator)');

-- ============================================================
-- PARTICIPANTS — Priya Sharma
-- ============================================================
insert into public.participants (id, profile_id, preferred_name, date_of_birth, primary_disability, secondary_disabilities, communication_profile, pronoun, profile_photo_url) values
  (priya_p_id, priya_auth_id, 'Priya', '1997-11-05',
   'Down Syndrome',
   array['Generalised Anxiety Disorder', 'Hypothyroidism', 'Mild hearing loss (right ear)'],
   'Priya communicates verbally and enjoys conversation about family, Bollywood films, and cooking. Use simple, clear language with one instruction at a time. Speak at a moderate pace. She may need requests repeated. Always make eye contact when speaking — she has mild hearing loss in her right ear, so speaking from her left side helps. She can read simple text. Use visual supports (pictures, written steps) for new tasks. She responds very well to warmth, humour, and positive reinforcement.',
   'she/her',
   'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaSharma'
  );

-- Support Manuals — Priya
insert into public.support_manuals (participant_id, title, content, category, is_critical) values
  (priya_p_id, 'Medication Administration Protocol',
   'Priya takes daily thyroid medication (levothyroxine) which must be administered at the same time each morning on an empty stomach, 30–60 minutes before eating.

Steps:
1. At 7:30am, offer Priya her medication with a full glass of water
2. Ensure she has not eaten anything since waking
3. Encourage her to take it herself — support only if she requests
4. Do not give with milk, calcium supplements, iron, or antacids (they block absorption)
5. Record administration in the medication log (blue folder in kitchen)
6. If Priya refuses medication: do not force. Offer again in 5 minutes. If she still refuses, contact her mother and document.

Signs of missed medication (hypothyroid symptoms): fatigue, constipation, feeling cold, slow speech. Contact GP if pattern persists.',
   'general', true),

  (priya_p_id, 'Daily Routine',
   'Morning (7:30am–10:00am):
- Wake up at 7:30am with a cheerful greeting — Priya loves mornings
- Medication at 7:30am (see medication protocol)
- Independent: toilet, washing hands and face. Assist with shower 3x/week (Monday, Wednesday, Friday)
- Dress: Priya selects her own clothes. She loves bright colours and traditional Indian clothing on special occasions. Support with buttons/zips if needed.
- Breakfast at 8:30am (after medication window): usually roti or toast with tea

Daytime activities (Monday, Wednesday, Friday shifts):
- 10:00am: community activities or day program (Chadstone Community Options)
- Priya loves cooking classes, gardening, and the social club at her day program

Evening:
- Dinner at 6:30pm — Priya often helps prepare simple meals
- Wind-down: Bollywood film or FaceTime with family
- Bed at 9:30pm. Brief bedtime routine: wash face, brush teeth.',
   'daily_routine', false),

  (priya_p_id, 'Anxiety Management',
   'Priya experiences generalised anxiety that may increase with unfamiliar situations, changes in routine, or family stress.

Signs of anxiety: increased questions ("Is everything okay?"), hand wringing, nail biting, reluctance to leave the house, tearfulness.

Prevention strategies:
- Give 10-minute warnings before transitions ("In 10 minutes we''ll get ready to go out")
- Use visual schedule if available
- Reassurance is effective: "Everything is fine. We''re going to [place] and we''ll be back by [time]."
- Maintain consistent routine as much as possible

Do not dismiss anxiety: "You''re fine" is unhelpful. Instead: "I can see you''re feeling a bit worried. That makes sense. Let''s talk about it."',
   'communication', false);

-- Incidents — Priya
insert into public.incident_types (participant_id, name, description, response_steps, when_to_call_000, when_to_call_support_coordinator, notes) values
  (priya_p_id, 'Anxiety Episode',
   'Priya becomes visibly distressed, may cry, refuse to engage in activities, repeat questions excessively, or become physically rigid. Can be triggered by perceived threat, change in routine, or unexplained sensory discomfort.',
   array[
     'Stay calm. Lower your own voice and slow your body language.',
     'Move to a quiet, familiar space if possible.',
     'Acknowledge her feelings: "I can see you''re upset. It''s okay. I''m here."',
     'Offer a familiar comfort: a cup of tea, her favourite blanket, or calling her mother.',
     'Use simple, reassuring language. One sentence at a time.',
     'Avoid asking lots of questions — this can escalate anxiety.',
     'If she is calm enough: use visual schedule to show what happens next.',
     'Document the episode and any identifiable triggers. Report to support coordinator if episodes are increasing.'
   ],
   false, true, 'Priya''s anxiety has been better managed since starting regular mindfulness at her day program.'),

  (priya_p_id, 'Hypothyroid Crisis (Severe Missed Medication)',
   'If Priya misses several days of levothyroxine or shows sudden worsening of symptoms: extreme fatigue, confusion, slurred speech, very slow heart rate, feeling very cold, puffy face. This is a medical emergency (myxoedema coma risk).',
   array[
     'Call 000 immediately and state: "I believe my client is experiencing a thyroid emergency."',
     'Keep Priya warm and lying down.',
     'Do not give food, water, or any oral medications while she is confused.',
     'Bring medication list and blue medication folder to show paramedics.',
     'Call her mother Meena Sharma immediately.',
     'Do not leave her alone.'
   ],
   true, true, 'This is a rare event — routine daily medication prevents it. Document any missed doses immediately.');

-- Dietary — Priya
insert into public.dietary_requirements (participant_id, requirement_type, description, severity, notes) values
  (priya_p_id, 'religious', 'Vegetarian — no meat, no eggs', 'serious', 'Hindu faith practice. Family has requested this be strictly maintained. Check all restaurant dishes.'),
  (priya_p_id, 'medical', 'Avoid high-iodine foods (seaweed, kelp, iodine supplements)', 'serious', 'Interferes with thyroid medication. Avoid: sushi with seaweed, miso soup with seaweed, iodine-enriched salt supplements.'),
  (priya_p_id, 'preference', 'Loves Indian food — prefers mild spice', 'preference', 'Mild to medium spice only. Very happy with dal, sabji, roti. Dislikes very sour foods.');

-- Emergency Contacts — Priya
insert into public.emergency_contacts (participant_id, full_name, relationship, phone_primary, phone_secondary, is_primary_contact, notes) values
  (priya_p_id, 'Meena Sharma', 'Mother', '0433 555 666', '(03) 9456 7890', true, 'Stay-at-home. Always reachable. Speaks English and Hindi. Very involved in Priya''s care.'),
  (priya_p_id, 'Rajesh Sharma', 'Father', '0444 666 777', null, false, 'Works as an accountant. Reachable after 5pm.'),
  (priya_p_id, 'Dr Kavita Nair', 'Endocrinologist', '(03) 9234 8765', null, false, 'For thyroid-related concerns. St Vincent''s Hospital Endocrinology.');

-- Medical Info — Priya
insert into public.medical_info (participant_id, gp_name, gp_phone, specialist_name, specialist_phone, medications, diagnoses, medicare_number, health_insurance) values
  (priya_p_id, 'Dr Fatima Al-Hassan', '(03) 9222 3333', 'Dr Kavita Nair (Endocrinologist)', '(03) 9234 8765',
   '[
     {"name": "Levothyroxine (Eutroxsig)", "dose": "75mcg", "frequency": "once daily at 7:30am, 30–60 min before food", "notes": "CRITICAL — do not miss. Do not give with dairy, calcium, or iron."},
     {"name": "Sertraline", "dose": "50mg", "frequency": "once daily with breakfast (after medication window)", "notes": "For anxiety. Started 8 months ago. Family reports good improvement."},
     {"name": "Vitamin B12", "dose": "1000mcg", "frequency": "once daily", "notes": "Down syndrome-related supplementation."}
   ]',
   '[
     {"condition": "Down Syndrome (Trisomy 21)", "diagnosed_date": "1997-11-05", "notes": "Mosaic presentation. Functional communication and daily living skills present."},
     {"condition": "Hypothyroidism", "diagnosed_date": "2010-03-01", "notes": "Well-controlled on levothyroxine. Thyroid function reviewed annually."},
     {"condition": "Generalised Anxiety Disorder", "diagnosed_date": "2022-06-01", "notes": "Managed with sertraline and behavioural strategies. Improving."},
     {"condition": "Mild sensorineural hearing loss (right ear)", "diagnosed_date": "2015-09-01", "notes": "Does not require hearing aid. Speak from her left side."}
   ]',
   '4567 89012 3', 'BUPA — Basic hospital');

-- BSP — Priya
insert into public.behaviour_support_plans (participant_id, title, summary, triggers, de_escalation_strategies, last_reviewed, reviewed_by) values
  (priya_p_id, 'Priya Sharma — Behaviour Support Plan v2.0',
   'Priya is a warm, social person who thrives with consistent routine, positive relationships, and meaningful community participation. Support behaviours (refusal, tearfulness, regression) are anxiety-based and communicative. This plan aims to prevent anxiety escalation through proactive routine management and relationship-centred care.',
   array[
     'Changes to routine without warning',
     'Unfamiliar people or environments',
     'Perceived criticism or feeling "told off"',
     'Family stress or conflict at home',
     'Fatigue or physical illness',
     'Being asked to do things she does not understand'
   ],
   array[
     'Warm, calm presence. Make eye contact. Use her name.',
     'Validate feelings: "I understand you''re feeling worried/sad/upset."',
     'Offer familiar comfort: tea, blanket, calling mum.',
     'Give one simple instruction at a time. Wait for compliance before giving next.',
     'Use positive reinforcement: "You did really well with that. Thank you."',
     'Offer visual support — write steps on paper or use pictures from her visual schedule folder (on fridge).',
     'If she is distressed about a task: "You don''t have to do that right now. Let''s take a break."'
   ],
   '2025-09-20', 'Elena Kowalski (Behaviour Support Practitioner)');

-- ============================================================
-- WORKER-PARTICIPANT LINKS
-- ============================================================
insert into public.worker_participant_links (worker_profile_id, participant_id, status) values
  (jordan_id, aisha_p_id, 'approved'),
  (jordan_id, marcus_p_id, 'approved'),
  (sam_id, marcus_p_id, 'approved'),
  (sam_id, priya_p_id, 'approved');

-- ============================================================
-- SAMPLE SHIFT NOTES
-- ============================================================
insert into public.shift_notes (worker_profile_id, participant_id, shift_date, note_text, mood_rating, incidents_occurred) values
  (jordan_id, aisha_p_id, '2026-05-20',
   'Arrived at 8am. Aisha was awake and had already started her breakfast — Weet-Bix with warm milk. Morning routine went smoothly. She used her AAC device to request her favourite music (Vietnamese pop) during hygiene routine. Community walk to the park at 10am — Aisha navigated well and seemed engaged. No seizure activity observed. Returned at 12pm. She rested 1–2pm as per routine. Afternoon: drawing activity requested via AAC. Dinner at 6pm (spaghetti bolognaise — confirmed no tree nuts). In good spirits throughout. Seizure medication administered at breakfast and dinner, both taken without issue.',
   4, false),

  (jordan_id, marcus_p_id, '2026-05-21',
   'Arrived 2pm. Marcus was mid-session on his music production — knocked and waited for him to call me in. Assisted with afternoon tea prep (he directed). Transport to TAFE — arranged Uber Assist, arrived on time. Picked up at 5:30pm. Evening: Marcus reported lower back pain (5/10) — repositioned with wedge support and applied heat pack. Pain reduced to 3/10 within 20 minutes. Dinner: chicken and rice (his request). Assisted with lower body undressing for bed transfer at 9:30pm — followed manual handling protocol. Wheelchair plugged in for overnight charging.',
   4, false),

  (sam_id, priya_p_id, '2026-05-22',
   'Morning shift 7:30am–1pm. Levothyroxine given at 7:30am with water — taken well. Breakfast at 8:30am. Priya was excited about cooking class today at the day program. Community transport arrived on time. At the day program she made banana bread with her group — she was proud and brought a piece home. Mood was excellent throughout the morning. One brief moment of anxiety when transport was 10 minutes late returning — reassured her with timing and she settled quickly. Medication log updated. No incidents.',
   5, false);

end $$;
