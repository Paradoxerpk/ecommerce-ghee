const bcrypt = require('bcryptjs');

const password = 'admin123';
const hashFromSchema = '$2a$10$QO0j8DkP74fH8XjEq9oYQ.xR2RszJb3d4fR5U2t3m08oYx57VbJae';

try {
  const isMatch = bcrypt.compareSync(password, hashFromSchema);
  console.log('Comparing "admin123" with schema hash:', isMatch);

  const newHash = bcrypt.hashSync(password, 10);
  console.log('Generated new hash for "admin123":', newHash);
} catch (e) {
  console.error('Bcrypt error:', e.message);
}
