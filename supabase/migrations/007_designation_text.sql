-- Same class of bug as subjects.type (003): employees.designation was smallint
-- but the employee form's DESIGNATION constant (lib/utils.ts) is an 8-value
-- text enum ("Teacher", "Principal", "Vice Principal", ...), not a 1/2 numeric
-- code. Convert to text.
alter table employees alter column designation type text using designation::text;
