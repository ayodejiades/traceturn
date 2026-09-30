/**
 * tests/acts.test.mjs — which numbers in a shell command are written, and which only observed.
 * Cases are taken from AI Village computer_use_turns bash commands.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { commandWritesAt } = await import(path.join(root, "lib/acts.ts"));
const at = (cmd, needle) => commandWritesAt(cmd, cmd.indexOf(needle));

test("a number in a redirect, commit message, in-place edit or heredoc into a file is written", () => {
  assert.equal(at('echo "- Total: 413 events" >> notes.md', "413"), true);
  assert.equal(at('git commit -m "156th milestone: 17,137 damage (Day 378)"', "17,137"), true);
  assert.equal(at("sed -i 's/219 damage/13,276 damage/' README.md", "13,276"), true);
  assert.equal(at("perl -pi -e 's/3508 damage/3600 damage/' log.md", "3600"), true);
  assert.equal(at("cat > report.md <<'EOF'\n# Status\n- 326 views, 12.43% open rate\nEOF", "326"), true);
  assert.equal(at('git commit -m "Update\n\nRaised $330 from 13 donors"', "$330"), true);
  assert.equal(at("python3 - <<'PY'\nopen('x.md','w').write('Files: 236 markdown')\nPY", "236"), true);
});

test("a number in a comment, terminal echo, print, grep or read-only command is not written", () => {
  assert.equal(at("# Someone already pushed 413 events, check what they cover\ngit log", "413"), false);
  assert.equal(at('echo "- Current: 5,100 secrets"', "5,100"), false);
  assert.equal(at("python3 -c \"print('PAGE', 326)\"", "326"), false);
  assert.equal(at("grep -E '$3,204|$704' handoff.md", "$3,204"), false);
  assert.equal(at("curl -s https://x.example/api | jq '.count' # 413 events", "413"), false);
  assert.equal(at("cat data.json | wc -l 2>&1 # 1,234 lines", "1,234"), false);
  assert.equal(at("python3 -c \"x = '<strong>178 patterns</strong>'\"", "178"), false);
  assert.equal(at("cat <<'EOF'\n129 views\nEOF", "129"), false);
});

test("a heredoc after its terminator no longer counts as inside it", () => {
  assert.equal(at("cat > a.md <<'EOF'\nx\nEOF\necho 413 events", "413"), false);
});

const { rankIncidents } = await import(path.join(root, "lib/report.ts"));
const row = (claim, agent, grounding = "UNGROUNDED", reach = 0) => ({ claim, agent, grounding, reach });

test("ranking: a value someone later corrected outranks a wider one nobody challenged", () => {
  const rows = [
    ...["a", "b", "c", "d", "e"].map((x) => row("$1984", x)),
    row("209 projects", "a"),
    row("209 projects", "b"),
  ];
  assert.deepEqual(rankIncidents(rows, new Set(["209 projects"])).map((r) => r.claim), ["209 projects", "$1984"]);
});

test("ranking: distinct agents beat repeated acts by one agent", () => {
  const rows = [
    ...Array.from({ length: 10 }, () => row("413 events", "a")),
    row("487 events", "a"),
    row("487 events", "b"),
    row("487 events", "c"),
  ];
  const [first, second] = rankIncidents(rows, new Set());
  assert.equal(first.claim, "487 events");
  assert.equal(first.agents, 3);
  assert.equal(second.agents, 1);
});

test("ranking: grounded acts do not count toward breadth, and ties fall to after-correction, then reach", () => {
  const rows = [
    row("x", "a", "GROUNDED"), row("x", "b", "GROUNDED"), row("x", "c", "UNGROUNDED"),
    row("y", "a", "AFTER_CORRECTION"),
    row("z", "a", "UNGROUNDED", 9),
  ];
  const r = rankIncidents(rows, new Set());
  assert.deepEqual(r.map((x) => x.claim), ["y", "z", "x"]);
  assert.equal(r.find((x) => x.claim === "x").agents, 1);
});
