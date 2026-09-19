-- Sample quizzes (3 questions each, pass mark 60%). Idempotent; run after seed.sql.
-- Correct answers go to quiz_answers, which learners cannot read.

create temp table _quiz_seed on commit drop as
select * from (values
  -- HTML & CSS
  ('html-css-fundamentals', 2, 1, 'Which element should hold the main navigation links of a page?',
   array['<div class="nav">','<nav>','<section>','<menu>'], 1,
   '<nav> is the landmark for major navigation blocks, which screen readers can jump to.'),
  ('html-css-fundamentals', 2, 2, 'You need something that performs an action on the page (not navigation). Which element fits?',
   array['<a href="#">','<span onclick>','<button>','<div role="link">'], 2,
   'If it does something, it is a <button>; if it goes somewhere, it is an <a>.'),
  ('html-css-fundamentals', 2, 3, 'How many <h1> elements should a typical page have?',
   array['As many as you like','Exactly one','None — use <h2> only','One per section'], 1,
   'One <h1> describes the page; nest <h2>, <h3> beneath it in order.'),

  ('html-css-fundamentals', 3, 1, 'Which layer of the box model sits between the content and the border?',
   array['Margin','Outline','Padding','Gap'], 2,
   'Padding is the space inside the border; margin is the space outside it.'),
  ('html-css-fundamentals', 3, 2, 'What does box-sizing: border-box change?',
   array['Width includes padding and border','Margins collapse','Borders become rounded','Content overflows hidden'], 0,
   'With border-box, width: 300px means 300px including padding and border.'),
  ('html-css-fundamentals', 3, 3, 'Which is generally the better way to win a specificity conflict?',
   array['Add !important everywhere','Use inline styles','Write simple, well-ordered class selectors','Repeat the selector ten times'], 2,
   'Simple class selectors keep CSS predictable; !important makes future changes painful.'),

  -- JavaScript
  ('javascript-essentials', 1, 1, 'Which is the best default for a variable that will not be reassigned?',
   array['var','let','const','static'], 2, 'Use const by default; reach for let only when the value must change.'),
  ('javascript-essentials', 1, 2, 'What does 0 === "0" evaluate to?',
   array['true','false','undefined','It throws an error'], 1,
   'Strict equality does not coerce types, so a number never equals a string.'),
  ('javascript-essentials', 1, 3, 'Which of these values is truthy?',
   array['0','""','null','[]'], 3, 'An empty array is truthy — only false, 0, "", null, undefined and NaN are falsy.'),

  ('javascript-essentials', 3, 1, 'Which method returns a new array containing only the items that pass a test?',
   array['map','reduce','filter','forEach'], 2, 'filter keeps the items for which the callback returns true.'),
  ('javascript-essentials', 3, 2, 'What is the best way to copy an object while changing one property?',
   array['obj.price = 15','{ ...obj, price: 15 }','delete obj.price','Object.freeze(obj)'], 1,
   'Spreading creates a new object instead of mutating the old one.'),
  ('javascript-essentials', 3, 3, 'What does reduce do?',
   array['Removes duplicates','Sorts an array','Folds a list into a single value','Shortens a string'], 2,
   'reduce accumulates every item into one result, such as a total.'),

  -- React
  ('react-in-depth', 2, 1, 'What happens when you call a state setter from useState?',
   array['The component re-renders with the new state','The page reloads','Props are mutated','Nothing until the next click'], 0,
   'Updating state schedules a re-render of the component.'),
  ('react-in-depth', 2, 2, 'Where may hooks be called?',
   array['Inside loops','Inside if statements','At the top level of a component or custom hook','Inside event handlers only'], 2,
   'Hooks must run in the same order every render, so call them only at the top level.'),
  ('react-in-depth', 2, 3, 'A value can be calculated from existing state. What should you do?',
   array['Store it in more state','Compute it during render','Save it in localStorage','Use an effect to sync it'], 1,
   'Derive values during render instead of duplicating them in state.'),

  -- TypeScript
  ('typescript-fundamentals', 1, 1, 'What happens to TypeScript types at runtime?',
   array['They are enforced by the browser','They are erased','They become comments','They throw warnings'], 1,
   'Types exist only at compile time; the output is plain JavaScript.'),
  ('typescript-fundamentals', 1, 2, 'Which tool validates data arriving from a server at runtime?',
   array['The TypeScript compiler','A schema validator such as Zod','ESLint','Prettier'], 1,
   'Types cannot check runtime data — use a validation library for that.'),
  ('typescript-fundamentals', 1, 3, 'Which is a real benefit of static typing?',
   array['Faster runtime performance','Bugs caught in the editor before running','No need for tests','Smaller bundles by default'], 1,
   'The checker points out mistakes as you type, long before production.'),

  -- Node REST APIs
  ('nodejs-rest-apis', 2, 1, 'Which HTTP method should create a new resource?',
   array['GET','DELETE','POST','HEAD'], 2, 'POST creates; GET reads; PATCH updates; DELETE removes.'),
  ('nodejs-rest-apis', 2, 2, 'What status code should a successful creation return?',
   array['200','201','204','301'], 1, '201 Created signals that a new resource now exists.'),
  ('nodejs-rest-apis', 2, 3, 'A client requests /courses/999 and it does not exist. Which status fits best?',
   array['500','403','404','200'], 2, '404 Not Found tells the client the resource does not exist.'),

  -- SQL
  ('sql-and-databases', 2, 1, 'How do you correctly test for a missing value?',
   array['column = null','column == null','column is null','column equals null'], 2,
   'NULL means unknown, so = null is never true — use IS NULL.'),
  ('sql-and-databases', 2, 2, 'Which clause limits how many rows are returned?',
   array['TOP BY','LIMIT','ONLY','COUNT'], 1, 'LIMIT (with OFFSET) pages through results.'),
  ('sql-and-databases', 2, 3, 'Which operator matches text case-insensitively in PostgreSQL?',
   array['LIKE','ILIKE','MATCHES','SIMILAR'], 1, 'ILIKE is the case-insensitive version of LIKE.'),

  ('sql-and-databases', 3, 1, 'Which join returns every row from the left table, even without a match?',
   array['INNER JOIN','LEFT JOIN','CROSS JOIN','SELF JOIN'], 1,
   'LEFT JOIN keeps all left rows, filling right-side columns with NULL when nothing matches.'),
  ('sql-and-databases', 3, 2, 'Your row count suddenly explodes after a join. What is the likely cause?',
   array['The index is missing','You joined on a column that is not unique on one side','The table is too small','ORDER BY was skipped'], 1,
   'Joining on a non-unique column multiplies rows; check counts before and after.'),
  ('sql-and-databases', 3, 3, 'What does an INNER JOIN return?',
   array['Only rows that match on both sides','All rows from both tables','Only unmatched rows','Rows from the left table'], 0,
   'INNER JOIN keeps rows with a match in both tables.'),

  -- UI design
  ('ui-design-principles', 1, 1, 'What is the "squint test" used for?',
   array['Checking spelling','Seeing whether the visual hierarchy still reads when blurred','Testing load speed','Measuring line length'], 1,
   'If everything blends together when blurred, nothing has clear priority.'),
  ('ui-design-principles', 1, 2, 'What is the minimum contrast ratio for normal body text?',
   array['1.5:1','3:1','4.5:1','21:1'], 2, 'WCAG requires at least 4.5:1 for normal text (3:1 for large text).'),
  ('ui-design-principles', 1, 3, 'How many primary actions should one view ideally have?',
   array['One','Three','As many as possible','None'], 0,
   'Several equally loud buttons means there is no primary action.'),

  -- Data science
  ('intro-to-data-science', 1, 1, 'Which is the most useful kind of data question?',
   array['How is our app doing?','Did weekly active users grow after the redesign?','Is data good?','What do customers think?'], 1,
   'Specific, measurable questions can actually be answered with data.'),
  ('intro-to-data-science', 1, 2, 'Ice cream sales and sunburns rise together. What is the best explanation?',
   array['Ice cream causes sunburn','Sunburn causes ice cream sales','Hot weather drives both','It is a coincidence'], 2,
   'A confounding factor (weather) explains both — correlation is not causation.'),
  ('intro-to-data-science', 1, 3, 'Which step usually takes the most time in a data project?',
   array['Charting','Cleaning the data','Writing the summary','Choosing a colour palette'], 1,
   'Cleaning and preparing data is typically most of the work.'),

  -- SEO
  ('seo-fundamentals', 2, 1, 'Which keyword is usually easiest to rank for?',
   array['SQL','SQL course','SQL joins tutorial for beginners','database'], 2,
   'Long-tail keywords are more specific and less competitive.'),
  ('seo-fundamentals', 2, 2, 'What is a pillar page?',
   array['A page with the most ads','A central page on a topic that supporting articles link back to','A 404 page','A login page'], 1,
   'Clustering content around a pillar shows depth on a topic.'),
  ('seo-fundamentals', 2, 3, 'Which of these is NOT a keyword evaluation factor from the lesson?',
   array['Relevance','Search intent','Domain colour','Difficulty'], 2,
   'The lesson covers relevance, intent, volume and difficulty.'),

  -- Project management
  ('project-management-basics', 1, 1, 'Which is NOT one of the five project phases?',
   array['Initiate','Plan','Celebrate','Close'], 2, 'The phases are initiate, plan, execute, monitor and close.'),
  ('project-management-basics', 1, 2, 'What are the three sides of the triple constraint?',
   array['Scope, time, cost','People, tools, process','Speed, style, size','Plan, do, review'], 0,
   'Scope, time and cost are linked — changing one affects the others.'),
  ('project-management-basics', 1, 3, 'Why define "done" before starting?',
   array['It looks professional','Ambiguity about the finish line causes endless projects','Managers require it','It reduces the budget'], 1,
   'A clear finish line prevents scope creep and never-ending work.'),

  -- Figma
  ('figma-for-beginners', 2, 1, 'What is the shortcut to add auto layout?',
   array['Ctrl/⌘ + G','Shift + A','F','Ctrl/⌘ + D'], 1, 'Shift + A wraps the selection in an auto layout frame.'),
  ('figma-for-beginners', 2, 2, 'Which resizing option makes a frame shrink to fit its content?',
   array['Fill container','Fixed width','Hug contents','Clip content'], 2, 'Hug contents sizes the frame around its children.'),
  ('figma-for-beginners', 2, 3, 'Auto layout in Figma is most similar to which CSS feature?',
   array['Float','Flexbox','Position: absolute','Tables'], 1, 'Auto layout mirrors Flexbox, which eases developer handoff.')
) as v(course_slug, lesson_pos, qpos, prompt, options, correct, explanation);

-- Replace quizzes for the seeded lessons.
delete from public.quiz_questions q
using public.lessons l, public.courses c
where q.lesson_id = l.id and l.course_id = c.id
  and c.slug in (select distinct course_slug from _quiz_seed);

insert into public.quiz_questions (id, lesson_id, "position", prompt, options, explanation)
select md5(l.id::text || ':q' || s.qpos)::uuid, l.id, s.qpos, s.prompt, s.options, s.explanation
from _quiz_seed s
join public.courses c on c.slug = s.course_slug
join public.lessons l on l.course_id = c.id and l."position" = s.lesson_pos;

insert into public.quiz_answers (question_id, correct_index)
select md5(l.id::text || ':q' || s.qpos)::uuid, s.correct
from _quiz_seed s
join public.courses c on c.slug = s.course_slug
join public.lessons l on l.course_id = c.id and l."position" = s.lesson_pos;
