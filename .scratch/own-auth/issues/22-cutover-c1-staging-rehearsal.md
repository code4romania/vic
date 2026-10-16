# C1 · Staging rehearsal: timed cutover runs, rollback drill, checklists, email review

Status: ready-for-human
Type: task
Blocked by: 11, 15, 19, 20, 00
Tracker card: C1

Run the whole cutover on staging against a copy of production data until two consecutive clean runs. The timings set the production window (total plus 50 %). Steps, smoke test, browser and device checklists, rollback drill and email review exactly as tracker card C1; record minutes per step under Comments.

## Exit criteria

- [ ] Two consecutive clean runs with total time recorded.
- [ ] Both OTA isolation results recorded (issues 18, 19).
- [ ] Store build approved and held.
- [ ] No unresolved pre-flight rows against a fresh production copy.

## Comments
