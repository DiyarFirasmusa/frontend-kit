# Structure: how code is split

The principles below hold in every project and stack. Where files live and what they are called is the project's
choice: the layout at the end is an example, never a target.

## Who decides, in this order

1. What the user asked for.
2. The project: "Where things are" in `project.md`, and the nearest existing code of the same role.
3. The framework's own convention.
4. The example below, only for a project that has no pattern yet.

The project decides where code lives, what it is called and which libraries it uses. The principles below decide how
code is written and split, and they hold for new code even where existing code breaks one (a request inside a view, say):
write the new code to the principle in the project's folders and names, and say so in the report. Only the user can set a
principle aside. Don't restructure existing code unasked.

## Principles

- **One reason to change.** A file, function or component does one job. Split by responsibility, not by line count;
  still, a component past ~200 lines, a function past ~50 or a file past 500 usually does more than one, so look.
- **Four roles, apart.**
  - *View* shows values and reports events.
  - *State* owns values that change, and the only ways to change them.
  - *Data* talks to the outside: network, storage, device.
  - *Logic* is pure functions: values in, values out, testable without the framework.
- **Views don't reach outside.** No storage, request or business calculation in a view. A page's view gets its data
  and actions from one place (a page hook, composable, controller or service).
- **One direction.** View uses state, state uses logic and data. Logic imports none of the others. No import cycles.
- **One owner.** Code lives with the feature that owns it, and moves to a shared place when a second one needs it.
  Nothing imports another feature's internals.
- **Reuse before adding.** The project's helper, pattern or installed library comes before a new one. A new dependency
  needs the user's yes.
- **One way per role.** New code has the shape, file name and language of the existing code of that role.
- **Edges are checked.** Data from storage, the network, the URL or the environment is validated where it enters.
  Environment variables are read in one module.
- **Import from the file.** No barrel (`index` files that only re-export): they hide cycles, defeat tree-shaking and
  slow the typechecker. A package's public entry point is the exception.
- **Nothing dead.** No unused file, export, copy or commented-out code.

## Example layout (new project with no convention)

Offer it to the user, don't impose it. The folders are named by the framework's habit (`features`, `modules`, `lib`).
For React + TanStack the same split has the folder names in `naming.md` (`hooks/`, `services/`, `utils/`, …): one example,
two spellings.

```text
<feature>/
  view         what the user sees
  state        what changes, and how
  data         requests, storage
  logic        pure functions, with their tests
shared/        only what two or more features use
```
