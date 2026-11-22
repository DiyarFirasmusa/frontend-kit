# Structure: how code is split

The principles below hold in every project and stack. Where files live and what they are called is the project's
choice: the layout at the end is an example, never a target.

## Who decides, in this order

1. What the user asked for.
2. The project: "Where things are" in `project.md`, and the nearest existing code of the same role.
3. The framework's own convention.
4. The example below, only for a project that has no pattern yet.

When 2 contradicts a principle, follow the project for this task and say so in the report. Don't restructure unasked.

## Principles

- **One reason to change.** A file, function or component does one job. Split by responsibility, not by line count.
- **Four roles, apart.**
  - *View* shows values and reports events.
  - *State* owns values that change, and the only ways to change them.
  - *Data* talks to the outside: network, storage, device.
  - *Logic* is pure functions: values in, values out, testable without the framework.
- **Views don't reach outside.** No storage, request or business calculation in a view.
- **One direction.** View uses state, state uses logic and data. Logic imports none of the others. No import cycles.
- **One owner.** Code lives with the feature that owns it, and moves to a shared place when a second one needs it.
  Nothing imports another feature's internals.
- **Reuse before adding.** The project's helper, pattern or installed library comes before a new one. A new dependency
  needs the user's yes.
- **One way per role.** New code has the shape, file name and language of the existing code of that role.
- **Edges are checked.** Data from storage, the network, the URL or the environment is validated where it enters.
  Environment variables are read in one module.
- **Nothing dead.** No unused file, export, copy or commented-out code.

## Example layout (new project with no convention)

Offer it to the user, don't impose it. The folders are named by the framework's habit (`features`, `modules`, `lib`).

```text
<feature>/
  view         what the user sees
  state        what changes, and how
  data         requests, storage
  logic        pure functions, with their tests
shared/        only what two or more features use
```
