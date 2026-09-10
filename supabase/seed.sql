-- Sample catalog data so the app isn't empty in development.
insert into public.categories (id, slug, name) values
  ('11111111-1111-1111-1111-111111111111', 'programming', 'Programming'),
  ('11111111-1111-1111-1111-111111111112', 'design', 'Design'),
  ('11111111-1111-1111-1111-111111111113', 'data', 'Data'),
  ('11111111-1111-1111-1111-111111111114', 'management', 'Management');

insert into public.tracks (id, slug, name, description, category_id) values
  ('22222222-2222-2222-2222-222222222221', 'frontend-development', 'Frontend Development',
   'Go from HTML basics to building production React applications.', '11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222222', 'product-design', 'Product Design',
   'Learn UX research, UI design, and prototyping with Figma.', '11111111-1111-1111-1111-111111111112');

insert into public.courses (id, slug, title, description, category_id, track_id, level, duration_minutes, published) values
  ('33333333-3333-3333-3333-333333333331', 'html-css-fundamentals', 'HTML & CSS Fundamentals',
   'Build your first web pages with modern, semantic HTML and CSS.',
   '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 'beginner', 180, true),
  ('33333333-3333-3333-3333-333333333332', 'javascript-essentials', 'JavaScript Essentials',
   'Master core JavaScript before moving on to frameworks.',
   '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 'beginner', 240, true),
  ('33333333-3333-3333-3333-333333333333', 'react-in-depth', 'React In Depth',
   'Component architecture, hooks, and state management in React.',
   '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', 'intermediate', 300, true),
  ('33333333-3333-3333-3333-333333333334', 'figma-for-beginners', 'Figma for Beginners',
   'Design your first interface and prototype it in Figma.',
   '11111111-1111-1111-1111-111111111112', '22222222-2222-2222-2222-222222222222', 'beginner', 150, true),
  ('33333333-3333-3333-3333-333333333335', 'intro-to-data-science', 'Intro to Data Science',
   'Statistics, Python, and your first data analysis project.',
   '11111111-1111-1111-1111-111111111113', null, 'beginner', 200, true);

insert into public.lessons (course_id, title, content, position, duration_minutes) values
  ('33333333-3333-3333-3333-333333333331', 'Setting up your editor', 'Install and configure VS Code.', 1, 15),
  ('33333333-3333-3333-3333-333333333331', 'Semantic HTML', 'Structure a page with meaningful tags.', 2, 30),
  ('33333333-3333-3333-3333-333333333331', 'CSS box model & layout', 'Flexbox and grid fundamentals.', 3, 45),
  ('33333333-3333-3333-3333-333333333332', 'Variables & types', 'let/const, primitives, and objects.', 1, 30),
  ('33333333-3333-3333-3333-333333333332', 'Functions & scope', 'Declarations, closures, and arrow functions.', 2, 40),
  ('33333333-3333-3333-3333-333333333332', 'Async JavaScript', 'Promises and async/await.', 3, 45),
  ('33333333-3333-3333-3333-333333333333', 'Components & props', 'Building your first React components.', 1, 40),
  ('33333333-3333-3333-3333-333333333333', 'State & hooks', 'useState, useEffect, and custom hooks.', 2, 50),
  ('33333333-3333-3333-3333-333333333334', 'The Figma interface', 'Frames, layers, and the toolbar.', 1, 20),
  ('33333333-3333-3333-3333-333333333335', 'Python basics for data', 'Lists, dicts, and pandas basics.', 1, 40);
