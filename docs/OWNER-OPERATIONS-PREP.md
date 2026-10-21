# Preparing to own and operate Target Practice

Planning guide — October 21, 2026. The app currently has local browser saves; production accounts, member storage and payments are not implemented. These preparations apply as we build that launch setup. They are not claims that it is already secured or certified.

## Your role

You do not need to learn programming before running the business. You do need to know what information the app holds, who can access it, how customers get help, and who acts when something fails. Development can implement controls and produce evidence. You approve business choices and own the production accounts. Specialist review adds a second check; neither AI nor a managed provider guarantees the whole app is secure.

## What you can prepare now

1. **Own the key accounts.** Use an email you control for the repository, domain, host, authentication/database provider and payment provider. Keep an inventory, enable multifactor authentication, and retain recovery codes securely. Use a password manager and individual collaborator access with only the permissions needed. Keep secrets and recovery codes out of chats, source files and public documents.
2. **Choose a support contact.** Set up a support email and name a backup person or contractor to contact if you are unavailable. Decide how payment, access and suspected data-exposure reports are escalated. Do not promise round-the-clock support without arranging it.
3. **Set the product boundaries.** Decide launch audience/markets, age policy, free/paid benefits and cancellation/refund terms. These determine what we build and what privacy, legal and tax questions need qualified advice. Collect only information needed for those benefits; GHIN and linked personal golf data can wait.
4. **Budget for operation and review.** Include hosting, database, email, monitoring, payments, support and a focused outside security review. A contractor can review the final account/data/payment architecture before launch; a permanent engineering team is not automatically necessary. Arrange ongoing availability separately if you want incident help after launch.

## Evidence we should have before paid launch

| Question you should be able to answer | Evidence development/review should provide |
| --- | --- |
| Can one member read or change another member's data? | Two-account tests that attempt direct requests against another account's records; server/database permissions deny them, including exports and deletion. |
| Can someone get paid access by editing the browser? | Trusted server authorization and tests for changed requests, direct URLs, expired subscriptions and account changes. |
| Do payment and access agree? | Hosted checkout/customer portal; verified billing-event handling; duplicate/out-of-order event tests; renewal, failure, cancellation and refund checks; reconciliation after missed events. We should avoid handling raw card details ourselves. |
| What data do we collect and where does it go? | A short data inventory listing purpose, provider/location as relevant, access, retention, deletion/export behavior and monitoring data. Published policies reflect actual behavior. |
| Can we recover lost data? | Automated production backups with agreed retention and a completed restore drill. Agree how much data loss and downtime the business can tolerate. Current downloadable browser backups do not substitute for this. |
| Can we undo a bad update? | A tested deployment rollback and, separately, a recovery plan for database migrations. Rolling back the website alone does not undo damaged data. |
| Will we know when something breaks? | Error, availability, billing-event, backup and spend alerts delivered to named people. Avoid sensitive data in logs; set appropriate retention and access. Test that alerts arrive. |
| Has someone checked beyond our own tests? | A scoped independent review of the final system, findings, fixes and retesting of significant issues. Review software/data dependencies and provider configuration as well as application code. |

These checks reduce risk; they do not prove that no vulnerability can exist. We should only close launch gates when their evidence is recorded. See [the launch checklist](../LAUNCH-CHECKLIST.md).

## A simple incident plan

Keep one short runbook with provider dashboards, account owners, emergency contacts and tested steps. Do not put credentials in it.

- **Identify:** Record the affected service, time, user impact and recent release. Preserve relevant logs without copying unnecessary personal data.
- **Contain:** The designated operator can pause checkout, disable an affected feature, revoke compromised access or roll back a release, according to the incident. Test these controls before launch.
- **Recover:** Use the agreed technical contact and provider support; restore from a verified backup where needed. Confirm data integrity, member access and payment state before reopening affected functions.
- **Communicate:** Keep affected customers informed. Suspected personal-data exposure needs prompt qualified advice about the applicable notification obligations; requirements depend on the facts and jurisdictions.
- **Learn:** Record the cause, corrective action and a check that would catch recurrence.

AI can help investigate logs you provide, propose fixes and test changes when tools/access are available. This chat does not watch the production site, receive alerts automatically or guarantee availability when an incident happens. Alerts need a human recipient and an escalation route. Routine development authority should not silently expand into permission to issue refunds, delete customer data, disclose incidents or change live billing.

## Routine ownership after launch

- **During the pilot and launch period:** Regularly review errors, support, failed billing events, backup status and costs; increase attention around releases.
- **On an agreed recurring schedule:** Review security/dependency updates, administrator access, data retention, spend and unresolved issues. Retest restore/recovery periodically and after material storage changes.
- **For each material release:** Review the change and relevant checks, confirm rollback/recovery, and record who authorized the production release. Reassess privacy/billing implications when adding services or data collection.

Keep a small readiness register: **item → named owner → evidence → open issue → next review**. A checklist without evidence or a person responsible is not an operating process.
