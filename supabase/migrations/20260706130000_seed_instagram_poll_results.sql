-- Seed Instagram poll results ahead of the existing backend poll queue.
-- Percentages are converted to vote counts out of 1000 voters.

WITH instagram_polls (position, id, question, option_a, votes_a, option_b, votes_b) AS (
VALUES
  (1, 'instagram-poll-001', 'Do you think you would take a bullet for someone you love?', 'Yes', 790, 'No', 210),
  (2, 'instagram-poll-002', 'Would you say that you are kind of a narcissist?', 'Yes', 420, 'No', 580),
  (3, 'instagram-poll-003', 'Would you sacrifice your pet for a close friend?', 'Yes', 540, 'No', 460),
  (4, 'instagram-poll-004', 'If you had the chance to restart your life, would you choose to be a different gender?', 'Yes', 50, 'No', 950),
  (5, 'instagram-poll-005', 'Where would you say you are right now in your current stage of life?', 'Up', 510, 'Down', 490),
  (6, 'instagram-poll-006', 'Would you consider yourself to be dominant or submissive?', 'Dominant', 540, 'Submissive', 460),
  (7, 'instagram-poll-007', 'Would you say you are stressed in life?', 'Yes', 850, 'No', 150),
  (8, 'instagram-poll-008', 'Are you prescribed any medications for your mental health?', 'Yes', 180, 'No', 820),
  (9, 'instagram-poll-009', 'Do you own a pet?', 'Yes', 520, 'No', 480),
  (10, 'instagram-poll-010', 'Is social media good or bad?', 'Good', 320, 'Bad', 680),
  (11, 'instagram-poll-011', 'Would you rather work hard or smart?', 'Hard', 70, 'Smart', 930),
  (12, 'instagram-poll-012', 'Would you rather be hot or cold?', 'Hot', 280, 'Cold', 720),
  (13, 'instagram-poll-013', 'Would you consider yourself to be a genius?', 'Yes', 280, 'No', 720),
  (14, 'instagram-poll-014', 'Do you think it is important to be a virgin before marriage?', 'Yes', 240, 'No', 760),
  (15, 'instagram-poll-015', 'How much does the weather affect your mood?', 'A lot', 590, 'A little', 410),
  (16, 'instagram-poll-016', 'Would you say you are better than the average?', 'Yes', 580, 'No', 420),
  (17, 'instagram-poll-017', 'Do you keep making the same mistake?', 'Yes', 700, 'No', 300),
  (18, 'instagram-poll-018', 'Do you think you are lacking self love?', 'Yes', 690, 'No', 310),
  (19, 'instagram-poll-019', 'Is it wrong to flirt with someone who is in a relationship?', 'Yes', 810, 'No', 190),
  (20, 'instagram-poll-020', 'Does love end up fading?', 'Yes', 590, 'No', 410),
  (21, 'instagram-poll-021', 'If you see a parent in front of you teaching their child something morally wrong or political, would you say anything?', 'Yes', 400, 'No', 600),
  (22, 'instagram-poll-022', 'Would you rather go out every day, or stay in every day?', 'Go out every day', 680, 'Stay in every day', 320),
  (23, 'instagram-poll-023', 'Do you believe in love?', 'Yes', 850, 'No', 150),
  (24, 'instagram-poll-024', 'Do you have self-respect?', 'Yes', 860, 'No', 140),
  (25, 'instagram-poll-025', 'Do you have self-love?', 'Yes', 680, 'No', 320),
  (26, 'instagram-poll-026', 'Do you think you can shoot someone in the head?', 'Yes', 290, 'No', 710),
  (27, 'instagram-poll-027', 'Do you think you can shoot someone?', 'Yes', 420, 'No', 580),
  (28, 'instagram-poll-028', 'Do you ever speak to God?', 'Yes', 760, 'No', 240),
  (29, 'instagram-poll-029', 'Do you believe in reincarnation?', 'Yes', 370, 'No', 630),
  (30, 'instagram-poll-030', 'Do you think it is normal if someone cries every day?', 'Yes', 320, 'No', 680),
  (31, 'instagram-poll-031', 'Do you cry every day?', 'Yes', 160, 'No', 840),
  (32, 'instagram-poll-032', 'Do you think life is harder for men or for women?', 'Men', 210, 'Women', 790),
  (33, 'instagram-poll-033', 'Have you ever felt like you have lost yourself?', 'Yes', 930, 'No', 70),
  (34, 'instagram-poll-034', 'Is it possible to love yourself too much?', 'Yes', 700, 'No', 300),
  (35, 'instagram-poll-035', 'Do you think life before was easier than how life is now?', 'Yes', 670, 'No', 330),
  (36, 'instagram-poll-036', 'If you are under the influence of drugs/alcohol, could cheating be excusable?', 'Yes', 110, 'No', 890),
  (37, 'instagram-poll-037', 'Would you rather be a human or an animal of your choice?', 'A human', 640, 'An animal of your choice', 360),
  (38, 'instagram-poll-038', 'Would you say you are good at giving love?', 'Yes', 650, 'No', 350),
  (39, 'instagram-poll-039', 'Do you think there is one right person for everyone?', 'Yes', 320, 'No', 680),
  (40, 'instagram-poll-040', 'Do you think someone''s love can be suicidal?', 'Yes', 500, 'No', 500),
  (41, 'instagram-poll-041', 'Do you have someone in mind who you wish you could actually kill?', 'Yes', 710, 'No', 290),
  (42, 'instagram-poll-042', 'Do you think you are or will be a hero to anyone?', 'Yes', 600, 'No', 400),
  (43, 'instagram-poll-043', 'Would you say you have more than one personality?', 'Yes', 770, 'No', 230),
  (44, 'instagram-poll-044', 'Do you think that puzzle piece is always replaceable?', 'Yes', 290, 'No', 710),
  (45, 'instagram-poll-045', 'Would you say the underdogs usually end up winning?', 'Yes', 420, 'No', 580),
  (46, 'instagram-poll-046', 'Have you ever looked deeply into someone''s eyes and only seen pain?', 'Yes', 680, 'No', 320),
  (47, 'instagram-poll-047', 'Do you feel like a victim?', 'Yes', 330, 'No', 670),
  (48, 'instagram-poll-048', 'Do you believe we have free will, or that it is all predetermined?', 'Free will', 590, 'Predetermined / written', 410),
  (49, 'instagram-poll-049', 'Are you more human or animal?', 'Human', 800, 'Animal', 200),
  (50, 'instagram-poll-050', 'Does this sentence offend anyone: "If somebody comes even close to sexually harassing my sister, I''ll rape his ass"?', 'Yes', 400, 'No', 600),
  (51, 'instagram-poll-051', 'Would you kill yourself to save your loved ones?', 'Yes', 810, 'No', 190),
  (52, 'instagram-poll-052', 'Do you think humans are better at creation or destruction?', 'Creation', 280, 'Destruction', 720),
  (53, 'instagram-poll-053', 'If you died, would you rather go to heaven or be resurrected on earth and live again?', 'Heaven', 720, 'Resurrected on earth', 280),
  (54, 'instagram-poll-054', 'Do you think you can fall in love with the person, or your idea of them?', 'The person', 410, 'Your idea of them', 590),
  (55, 'instagram-poll-055', 'Do you believe in life after death?', 'Yes', 730, 'No', 270),
  (56, 'instagram-poll-056', 'If a friend made you angry, would you feel better if you got back at them?', 'Yes', 350, 'No', 650),
  (57, 'instagram-poll-057', 'Do you think that you manifested your soulmate the moment you wanted to fall in love?', 'Yes', 430, 'No', 570),
  (58, 'instagram-poll-058', 'Do you think there are more people who are alpha or beta?', 'Alpha', 260, 'Beta', 740),
  (59, 'instagram-poll-059', 'Do you ever really stop loving someone?', 'Yes', 610, 'No', 390),
  (60, 'instagram-poll-060', 'Do you think animals can fall in love?', 'Yes', 840, 'No', 160),
  (61, 'instagram-poll-061', 'Would you give up your children to someone of a different religion?', 'Yes', 420, 'No', 580),
  (62, 'instagram-poll-062', 'Have you been feeling more patriotic for your country these days?', 'Yes', 460, 'No', 540),
  (63, 'instagram-poll-063', 'Do you believe in demons?', 'Yes', 640, 'No', 360),
  (64, 'instagram-poll-064', 'Would you accept your child if they were gay?', 'Yes', 730, 'No', 270),
  (65, 'instagram-poll-065', 'Do you fear your parents?', 'Yes', 320, 'No', 680),
  (66, 'instagram-poll-066', 'Are you comfortable with your sexuality?', 'Yes', 890, 'No', 110),
  (67, 'instagram-poll-067', 'Is ignorance bliss?', 'Yes', 530, 'No', 470),
  (68, 'instagram-poll-068', 'Do you lie often?', 'Yes', 440, 'No', 560),
  (69, 'instagram-poll-069', 'Do you think the music you listen to resembles your personality?', 'Yes', 750, 'No', 250),
  (70, 'instagram-poll-070', 'Would you be scared to meet an alien?', 'Yes', 440, 'No', 560),
  (71, 'instagram-poll-071', 'Do you think the world rests in your hands?', 'Yes', 270, 'No', 730),
  (72, 'instagram-poll-072', 'Do you have any fetishes that are considered "weird" by the general public?', 'Yes', 500, 'No', 500),
  (73, 'instagram-poll-073', 'Do you think exes can be true friends?', 'Yes', 590, 'No', 410),
  (74, 'instagram-poll-074', 'Would you rather have a note that can kill anyone, or a note that can bring the dead back to life?', 'Death note', 250, 'Life note', 750),
  (75, 'instagram-poll-075', 'Do you think love is overrated?', 'Yes', 400, 'No', 600),
  (76, 'instagram-poll-076', 'Would you rather end hunger, or hatred?', 'Hunger', 440, 'Hatred', 560),
  (77, 'instagram-poll-077', 'Have you shared your problems with your family whilst growing up?', 'Yes', 340, 'No', 660),
  (78, 'instagram-poll-078', 'What do you think, overall, has more power?', 'Love', 80, 'Money', 920),
  (79, 'instagram-poll-079', 'Are you more black and white, or grey?', 'Black and white', 480, 'Grey', 520),
  (80, 'instagram-poll-080', 'Can love be a choice?', 'Yes', 560, 'No', 440),
  (81, 'instagram-poll-081', 'Would you rather focus your life on finding love or finding your passion for work?', 'Love', 350, 'Work', 650),
  (82, 'instagram-poll-082', 'Would you accept extra tax payments for free health care for everyone in the country?', 'Yes', 860, 'No', 140),
  (83, 'instagram-poll-083', 'Do you think more men or women are "heartbroken"?', 'Men', 360, 'Women', 640),
  (84, 'instagram-poll-084', 'Can you gain the same trust after losing it before?', 'Yes', 210, 'No', 790),
  (85, 'instagram-poll-085', 'Do you think sharing memes is a great way to connect?', 'Yes', 850, 'No', 150),
  (86, 'instagram-poll-086', 'Would you rather be an ugly genius, or be beautiful but dumb?', 'Ugly genius', 740, 'Beautiful but dumb', 260),
  (87, 'instagram-poll-087', 'Would you want to live in this kind of house?', 'Yes', 670, 'No', 330)
)
INSERT INTO public.polls (id, question, options, status, is_onboarding, created_at)
SELECT
  id,
  question,
  jsonb_build_array(
    jsonb_build_object('id', id || '-a', 'text', option_a, 'label', option_a, 'votes', votes_a),
    jsonb_build_object('id', id || '-b', 'text', option_b, 'label', option_b, 'votes', votes_b)
  ),
  'active',
  false,
  now() + ((1000 - position) * interval '1 second')
FROM instagram_polls
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  options = EXCLUDED.options,
  status = EXCLUDED.status,
  is_onboarding = EXCLUDED.is_onboarding,
  created_at = EXCLUDED.created_at;

WITH instagram_polls (position, id, question, option_a, votes_a, option_b, votes_b) AS (
VALUES
  (1, 'instagram-poll-001', 'Do you think you would take a bullet for someone you love?', 'Yes', 790, 'No', 210),
  (2, 'instagram-poll-002', 'Would you say that you are kind of a narcissist?', 'Yes', 420, 'No', 580),
  (3, 'instagram-poll-003', 'Would you sacrifice your pet for a close friend?', 'Yes', 540, 'No', 460),
  (4, 'instagram-poll-004', 'If you had the chance to restart your life, would you choose to be a different gender?', 'Yes', 50, 'No', 950),
  (5, 'instagram-poll-005', 'Where would you say you are right now in your current stage of life?', 'Up', 510, 'Down', 490),
  (6, 'instagram-poll-006', 'Would you consider yourself to be dominant or submissive?', 'Dominant', 540, 'Submissive', 460),
  (7, 'instagram-poll-007', 'Would you say you are stressed in life?', 'Yes', 850, 'No', 150),
  (8, 'instagram-poll-008', 'Are you prescribed any medications for your mental health?', 'Yes', 180, 'No', 820),
  (9, 'instagram-poll-009', 'Do you own a pet?', 'Yes', 520, 'No', 480),
  (10, 'instagram-poll-010', 'Is social media good or bad?', 'Good', 320, 'Bad', 680),
  (11, 'instagram-poll-011', 'Would you rather work hard or smart?', 'Hard', 70, 'Smart', 930),
  (12, 'instagram-poll-012', 'Would you rather be hot or cold?', 'Hot', 280, 'Cold', 720),
  (13, 'instagram-poll-013', 'Would you consider yourself to be a genius?', 'Yes', 280, 'No', 720),
  (14, 'instagram-poll-014', 'Do you think it is important to be a virgin before marriage?', 'Yes', 240, 'No', 760),
  (15, 'instagram-poll-015', 'How much does the weather affect your mood?', 'A lot', 590, 'A little', 410),
  (16, 'instagram-poll-016', 'Would you say you are better than the average?', 'Yes', 580, 'No', 420),
  (17, 'instagram-poll-017', 'Do you keep making the same mistake?', 'Yes', 700, 'No', 300),
  (18, 'instagram-poll-018', 'Do you think you are lacking self love?', 'Yes', 690, 'No', 310),
  (19, 'instagram-poll-019', 'Is it wrong to flirt with someone who is in a relationship?', 'Yes', 810, 'No', 190),
  (20, 'instagram-poll-020', 'Does love end up fading?', 'Yes', 590, 'No', 410),
  (21, 'instagram-poll-021', 'If you see a parent in front of you teaching their child something morally wrong or political, would you say anything?', 'Yes', 400, 'No', 600),
  (22, 'instagram-poll-022', 'Would you rather go out every day, or stay in every day?', 'Go out every day', 680, 'Stay in every day', 320),
  (23, 'instagram-poll-023', 'Do you believe in love?', 'Yes', 850, 'No', 150),
  (24, 'instagram-poll-024', 'Do you have self-respect?', 'Yes', 860, 'No', 140),
  (25, 'instagram-poll-025', 'Do you have self-love?', 'Yes', 680, 'No', 320),
  (26, 'instagram-poll-026', 'Do you think you can shoot someone in the head?', 'Yes', 290, 'No', 710),
  (27, 'instagram-poll-027', 'Do you think you can shoot someone?', 'Yes', 420, 'No', 580),
  (28, 'instagram-poll-028', 'Do you ever speak to God?', 'Yes', 760, 'No', 240),
  (29, 'instagram-poll-029', 'Do you believe in reincarnation?', 'Yes', 370, 'No', 630),
  (30, 'instagram-poll-030', 'Do you think it is normal if someone cries every day?', 'Yes', 320, 'No', 680),
  (31, 'instagram-poll-031', 'Do you cry every day?', 'Yes', 160, 'No', 840),
  (32, 'instagram-poll-032', 'Do you think life is harder for men or for women?', 'Men', 210, 'Women', 790),
  (33, 'instagram-poll-033', 'Have you ever felt like you have lost yourself?', 'Yes', 930, 'No', 70),
  (34, 'instagram-poll-034', 'Is it possible to love yourself too much?', 'Yes', 700, 'No', 300),
  (35, 'instagram-poll-035', 'Do you think life before was easier than how life is now?', 'Yes', 670, 'No', 330),
  (36, 'instagram-poll-036', 'If you are under the influence of drugs/alcohol, could cheating be excusable?', 'Yes', 110, 'No', 890),
  (37, 'instagram-poll-037', 'Would you rather be a human or an animal of your choice?', 'A human', 640, 'An animal of your choice', 360),
  (38, 'instagram-poll-038', 'Would you say you are good at giving love?', 'Yes', 650, 'No', 350),
  (39, 'instagram-poll-039', 'Do you think there is one right person for everyone?', 'Yes', 320, 'No', 680),
  (40, 'instagram-poll-040', 'Do you think someone''s love can be suicidal?', 'Yes', 500, 'No', 500),
  (41, 'instagram-poll-041', 'Do you have someone in mind who you wish you could actually kill?', 'Yes', 710, 'No', 290),
  (42, 'instagram-poll-042', 'Do you think you are or will be a hero to anyone?', 'Yes', 600, 'No', 400),
  (43, 'instagram-poll-043', 'Would you say you have more than one personality?', 'Yes', 770, 'No', 230),
  (44, 'instagram-poll-044', 'Do you think that puzzle piece is always replaceable?', 'Yes', 290, 'No', 710),
  (45, 'instagram-poll-045', 'Would you say the underdogs usually end up winning?', 'Yes', 420, 'No', 580),
  (46, 'instagram-poll-046', 'Have you ever looked deeply into someone''s eyes and only seen pain?', 'Yes', 680, 'No', 320),
  (47, 'instagram-poll-047', 'Do you feel like a victim?', 'Yes', 330, 'No', 670),
  (48, 'instagram-poll-048', 'Do you believe we have free will, or that it is all predetermined?', 'Free will', 590, 'Predetermined / written', 410),
  (49, 'instagram-poll-049', 'Are you more human or animal?', 'Human', 800, 'Animal', 200),
  (50, 'instagram-poll-050', 'Does this sentence offend anyone: "If somebody comes even close to sexually harassing my sister, I''ll rape his ass"?', 'Yes', 400, 'No', 600),
  (51, 'instagram-poll-051', 'Would you kill yourself to save your loved ones?', 'Yes', 810, 'No', 190),
  (52, 'instagram-poll-052', 'Do you think humans are better at creation or destruction?', 'Creation', 280, 'Destruction', 720),
  (53, 'instagram-poll-053', 'If you died, would you rather go to heaven or be resurrected on earth and live again?', 'Heaven', 720, 'Resurrected on earth', 280),
  (54, 'instagram-poll-054', 'Do you think you can fall in love with the person, or your idea of them?', 'The person', 410, 'Your idea of them', 590),
  (55, 'instagram-poll-055', 'Do you believe in life after death?', 'Yes', 730, 'No', 270),
  (56, 'instagram-poll-056', 'If a friend made you angry, would you feel better if you got back at them?', 'Yes', 350, 'No', 650),
  (57, 'instagram-poll-057', 'Do you think that you manifested your soulmate the moment you wanted to fall in love?', 'Yes', 430, 'No', 570),
  (58, 'instagram-poll-058', 'Do you think there are more people who are alpha or beta?', 'Alpha', 260, 'Beta', 740),
  (59, 'instagram-poll-059', 'Do you ever really stop loving someone?', 'Yes', 610, 'No', 390),
  (60, 'instagram-poll-060', 'Do you think animals can fall in love?', 'Yes', 840, 'No', 160),
  (61, 'instagram-poll-061', 'Would you give up your children to someone of a different religion?', 'Yes', 420, 'No', 580),
  (62, 'instagram-poll-062', 'Have you been feeling more patriotic for your country these days?', 'Yes', 460, 'No', 540),
  (63, 'instagram-poll-063', 'Do you believe in demons?', 'Yes', 640, 'No', 360),
  (64, 'instagram-poll-064', 'Would you accept your child if they were gay?', 'Yes', 730, 'No', 270),
  (65, 'instagram-poll-065', 'Do you fear your parents?', 'Yes', 320, 'No', 680),
  (66, 'instagram-poll-066', 'Are you comfortable with your sexuality?', 'Yes', 890, 'No', 110),
  (67, 'instagram-poll-067', 'Is ignorance bliss?', 'Yes', 530, 'No', 470),
  (68, 'instagram-poll-068', 'Do you lie often?', 'Yes', 440, 'No', 560),
  (69, 'instagram-poll-069', 'Do you think the music you listen to resembles your personality?', 'Yes', 750, 'No', 250),
  (70, 'instagram-poll-070', 'Would you be scared to meet an alien?', 'Yes', 440, 'No', 560),
  (71, 'instagram-poll-071', 'Do you think the world rests in your hands?', 'Yes', 270, 'No', 730),
  (72, 'instagram-poll-072', 'Do you have any fetishes that are considered "weird" by the general public?', 'Yes', 500, 'No', 500),
  (73, 'instagram-poll-073', 'Do you think exes can be true friends?', 'Yes', 590, 'No', 410),
  (74, 'instagram-poll-074', 'Would you rather have a note that can kill anyone, or a note that can bring the dead back to life?', 'Death note', 250, 'Life note', 750),
  (75, 'instagram-poll-075', 'Do you think love is overrated?', 'Yes', 400, 'No', 600),
  (76, 'instagram-poll-076', 'Would you rather end hunger, or hatred?', 'Hunger', 440, 'Hatred', 560),
  (77, 'instagram-poll-077', 'Have you shared your problems with your family whilst growing up?', 'Yes', 340, 'No', 660),
  (78, 'instagram-poll-078', 'What do you think, overall, has more power?', 'Love', 80, 'Money', 920),
  (79, 'instagram-poll-079', 'Are you more black and white, or grey?', 'Black and white', 480, 'Grey', 520),
  (80, 'instagram-poll-080', 'Can love be a choice?', 'Yes', 560, 'No', 440),
  (81, 'instagram-poll-081', 'Would you rather focus your life on finding love or finding your passion for work?', 'Love', 350, 'Work', 650),
  (82, 'instagram-poll-082', 'Would you accept extra tax payments for free health care for everyone in the country?', 'Yes', 860, 'No', 140),
  (83, 'instagram-poll-083', 'Do you think more men or women are "heartbroken"?', 'Men', 360, 'Women', 640),
  (84, 'instagram-poll-084', 'Can you gain the same trust after losing it before?', 'Yes', 210, 'No', 790),
  (85, 'instagram-poll-085', 'Do you think sharing memes is a great way to connect?', 'Yes', 850, 'No', 150),
  (86, 'instagram-poll-086', 'Would you rather be an ugly genius, or be beautiful but dumb?', 'Ugly genius', 740, 'Beautiful but dumb', 260),
  (87, 'instagram-poll-087', 'Would you want to live in this kind of house?', 'Yes', 670, 'No', 330)
)
INSERT INTO public.poll_options (id, poll_id, label, position)
SELECT id || '-a', id, option_a, 0 FROM instagram_polls
UNION ALL
SELECT id || '-b', id, option_b, 1 FROM instagram_polls
ON CONFLICT (id) DO UPDATE SET
  poll_id = EXCLUDED.poll_id,
  label = EXCLUDED.label,
  position = EXCLUDED.position;

CREATE OR REPLACE FUNCTION public.get_polls_with_vote_counts(p_limit integer DEFAULT 10)
RETURNS TABLE (
  id text,
  question text,
  locked boolean,
  options jsonb
)
LANGUAGE sql
STABLE
AS $$
  WITH selected_polls AS (
    SELECT p.id, p.question, p.locked, p.status, p.options, p.created_at
    FROM public.polls p
    WHERE COALESCE(p.status, 'active') <> 'locked'
    ORDER BY p.created_at DESC
    LIMIT GREATEST(p_limit, 1)
  ),
  json_options AS (
    SELECT
      sp.id AS poll_id,
      (json_option.ordinality - 1)::integer AS position,
      json_option.value->>'id' AS option_id,
      COALESCE(json_option.value->>'text', json_option.value->>'label') AS label,
      COALESCE((json_option.value->>'votes')::integer, 0) AS seed_votes
    FROM selected_polls sp
    CROSS JOIN LATERAL jsonb_array_elements(sp.options) WITH ORDINALITY AS json_option(value, ordinality)
  ),
  option_rows AS (
    SELECT
      sp.id AS poll_id,
      po.id AS option_id,
      po.label AS label,
      po.position AS position,
      COALESCE(jo.seed_votes, 0) AS seed_votes
    FROM selected_polls sp
    JOIN public.poll_options po ON po.poll_id = sp.id
    LEFT JOIN json_options jo ON jo.poll_id = sp.id AND jo.position = po.position
    UNION ALL
    SELECT
      jo.poll_id,
      COALESCE(jo.option_id, jo.poll_id || '-option-' || (jo.position + 1)::text) AS option_id,
      jo.label,
      jo.position,
      jo.seed_votes
    FROM json_options jo
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.poll_options po
      WHERE po.poll_id = jo.poll_id
    )
  ),
  vote_counts AS (
    SELECT poll_id, option_id, count(*)::integer AS votes
    FROM public.poll_votes
    GROUP BY poll_id, option_id
  )
  SELECT
    sp.id,
    sp.question,
    COALESCE(sp.locked, false) OR sp.status = 'locked' AS locked,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', opt.option_id,
          'text', opt.label,
          'votes', opt.seed_votes + COALESCE(vc.votes, 0)
        )
        ORDER BY opt.position
      ) FILTER (WHERE opt.option_id IS NOT NULL AND opt.label IS NOT NULL),
      '[]'::jsonb
    ) AS options
  FROM selected_polls sp
  LEFT JOIN option_rows opt ON opt.poll_id = sp.id
  LEFT JOIN vote_counts vc ON vc.poll_id = opt.poll_id AND vc.option_id = opt.option_id
  GROUP BY sp.id, sp.question, sp.locked, sp.status, sp.created_at
  ORDER BY sp.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_polls_with_vote_counts(integer) TO anon, authenticated;
