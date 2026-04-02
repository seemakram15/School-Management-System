-- subjects.type was smallint (1=compulsory, 2=optional) but the app writes/reads
-- text values ("core"/"selective"/"elective") everywhere else (new-subject form,
-- registration_subjects.type). Convert to text to match.
alter table subjects alter column type drop default;
alter table subjects alter column type type text using (case type when 1 then 'core' when 2 then 'selective' else 'core' end);
alter table subjects alter column type set default 'core';
