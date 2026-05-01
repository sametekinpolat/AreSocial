# Graph Report - .  (2026-05-01)

## Corpus Check
- 74 files · ~234,586 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 149 nodes · 148 edges · 68 communities detected
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Auth & Community DB Schema|Auth & Community DB Schema]]
- [[_COMMUNITY_Auth & Email Actions|Auth & Email Actions]]
- [[_COMMUNITY_Content & Interactions Schema|Content & Interactions Schema]]
- [[_COMMUNITY_Home Page Client|Home Page Client]]
- [[_COMMUNITY_Post CRUD Actions|Post CRUD Actions]]
- [[_COMMUNITY_Auth UI Pages|Auth UI Pages]]
- [[_COMMUNITY_Dropdown Menu UI|Dropdown Menu UI]]
- [[_COMMUNITY_NextAuth Configuration|NextAuth Configuration]]
- [[_COMMUNITY_Email Verify Page|Email Verify Page]]
- [[_COMMUNITY_Card Component|Card Component]]
- [[_COMMUNITY_Scroll Area UI|Scroll Area UI]]
- [[_COMMUNITY_Prisma Client Core|Prisma Client Core]]
- [[_COMMUNITY_App Root Layout|App Root Layout]]
- [[_COMMUNITY_Home Page|Home Page]]
- [[_COMMUNITY_Session Provider|Session Provider]]
- [[_COMMUNITY_Theme Provider|Theme Provider]]
- [[_COMMUNITY_Button Component|Button Component]]
- [[_COMMUNITY_Label Component|Label Component]]
- [[_COMMUNITY_Mode Toggle|Mode Toggle]]
- [[_COMMUNITY_Utility Functions|Utility Functions]]
- [[_COMMUNITY_Module 20|Module 20]]
- [[_COMMUNITY_Module 21|Module 21]]
- [[_COMMUNITY_Module 22|Module 22]]
- [[_COMMUNITY_Module 23|Module 23]]
- [[_COMMUNITY_Module 24|Module 24]]
- [[_COMMUNITY_Module 25|Module 25]]
- [[_COMMUNITY_Module 26|Module 26]]
- [[_COMMUNITY_Module 27|Module 27]]
- [[_COMMUNITY_Module 28|Module 28]]
- [[_COMMUNITY_Module 29|Module 29]]
- [[_COMMUNITY_Module 30|Module 30]]
- [[_COMMUNITY_Module 31|Module 31]]
- [[_COMMUNITY_Module 32|Module 32]]
- [[_COMMUNITY_Module 33|Module 33]]
- [[_COMMUNITY_Module 34|Module 34]]
- [[_COMMUNITY_Module 35|Module 35]]
- [[_COMMUNITY_Module 36|Module 36]]
- [[_COMMUNITY_Module 37|Module 37]]
- [[_COMMUNITY_Module 38|Module 38]]
- [[_COMMUNITY_Module 39|Module 39]]
- [[_COMMUNITY_Module 40|Module 40]]
- [[_COMMUNITY_Module 41|Module 41]]
- [[_COMMUNITY_Module 42|Module 42]]
- [[_COMMUNITY_Module 43|Module 43]]
- [[_COMMUNITY_Module 44|Module 44]]
- [[_COMMUNITY_Module 45|Module 45]]
- [[_COMMUNITY_Module 46|Module 46]]
- [[_COMMUNITY_Module 47|Module 47]]
- [[_COMMUNITY_Module 48|Module 48]]
- [[_COMMUNITY_Module 49|Module 49]]
- [[_COMMUNITY_Module 50|Module 50]]
- [[_COMMUNITY_Module 51|Module 51]]
- [[_COMMUNITY_Module 52|Module 52]]
- [[_COMMUNITY_Module 53|Module 53]]
- [[_COMMUNITY_Module 54|Module 54]]
- [[_COMMUNITY_Module 55|Module 55]]
- [[_COMMUNITY_Module 56|Module 56]]
- [[_COMMUNITY_Module 57|Module 57]]
- [[_COMMUNITY_Module 58|Module 58]]
- [[_COMMUNITY_Module 59|Module 59]]
- [[_COMMUNITY_Module 60|Module 60]]
- [[_COMMUNITY_Module 61|Module 61]]
- [[_COMMUNITY_Module 62|Module 62]]
- [[_COMMUNITY_Module 63|Module 63]]
- [[_COMMUNITY_Module 64|Module 64]]
- [[_COMMUNITY_Module 65|Module 65]]
- [[_COMMUNITY_Module 66|Module 66]]
- [[_COMMUNITY_Module 67|Module 67]]

## God Nodes (most connected - your core abstractions)
1. `users (table)` - 22 edges
2. `Content & Interactions ER Diagram` - 13 edges
3. `communities (table)` - 11 edges
4. `posts (table)` - 11 edges
5. `comments (table)` - 10 edges
6. `Communities & Moderation ER Diagram` - 9 edges
7. `checkRateLimit()` - 7 edges
8. `Auth & User Profiles ER Diagram` - 6 edges
9. `reports (table)` - 6 edges
10. `getIp()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `handleResend()` --calls--> `resendVerificationEmailAction()`  [INFERRED]
  src\app\(auth)\verify-email\page.tsx → src\actions\auth.ts
- `loginAction()` --calls--> `checkRateLimit()`  [INFERRED]
  src\actions\auth.ts → src\lib\rate-limit.ts
- `resendVerificationEmailAction()` --calls--> `checkRateLimit()`  [INFERRED]
  src\actions\auth.ts → src\lib\rate-limit.ts
- `resendVerificationEmailAction()` --calls--> `sendVerificationEmail()`  [INFERRED]
  src\actions\auth.ts → src\lib\mail.ts
- `registerAction()` --calls--> `checkRateLimit()`  [INFERRED]
  src\actions\auth.ts → src\lib\rate-limit.ts

## Hyperedges (group relationships)
- **User Authentication & Profile Data** — auth_users, auth_accounts, auth_sessions, auth_verification_tokens, auth_user_preferences [EXTRACTED 1.00]
- **Community Governance Tables** — comm_communities, comm_community_members, comm_community_moderators, comm_community_rules, comm_community_restrictions [EXTRACTED 1.00]
- **Moderation & Safety Tables** — comm_mod_logs, comm_reports, comm_user_blocks, comm_community_restrictions [INFERRED 0.85]
- **Voting System Tables** — content_post_votes, content_comment_votes, auth_users, content_posts, content_comments [EXTRACTED 1.00]
- **Content Edit Audit Tables** — content_post_edit_history, content_comment_edit_history, content_posts, content_comments [EXTRACTED 1.00]
- **User Interaction & Messaging Tables** — content_direct_messages, content_notifications, content_saved_posts, content_saved_comments [INFERRED 0.80]

## Communities

### Community 0 - "Auth & Community DB Schema"
Cohesion: 0.23
Nodes (20): accounts (table), Auth & User Profiles ER Diagram, global_moderators (table), sessions (table), user_preferences (table), users (table), verification_tokens (table), communities (table) (+12 more)

### Community 1 - "Auth & Email Actions"
Cohesion: 0.18
Nodes (11): completeOnboardingAction(), getIp(), loginAction(), registerAction(), resendVerificationEmailAction(), sendVerificationEmail(), handleResend(), checkRateLimit() (+3 more)

### Community 2 - "Content & Interactions Schema"
Cohesion: 0.42
Nodes (11): comment_edit_history (table), comment_votes (table), comments (table), Content & Interactions ER Diagram, media (table), post_edit_history (table), post_flairs (table), post_votes (table) (+3 more)

### Community 3 - "Home Page Client"
Cohesion: 0.33
Nodes (0): 

### Community 4 - "Post CRUD Actions"
Cohesion: 0.5
Nodes (2): createPostAction(), getOrCreateDemoCommunity()

### Community 5 - "Auth UI Pages"
Cohesion: 0.5
Nodes (2): handleSubmit(), handleUsernameChange()

### Community 6 - "Dropdown Menu UI"
Cohesion: 0.5
Nodes (0): 

### Community 7 - "NextAuth Configuration"
Cohesion: 0.67
Nodes (0): 

### Community 8 - "Email Verify Page"
Cohesion: 0.67
Nodes (0): 

### Community 9 - "Card Component"
Cohesion: 0.67
Nodes (0): 

### Community 10 - "Scroll Area UI"
Cohesion: 0.67
Nodes (0): 

### Community 11 - "Prisma Client Core"
Cohesion: 0.67
Nodes (0): 

### Community 12 - "App Root Layout"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Home Page"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Session Provider"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Theme Provider"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Button Component"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Label Component"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Mode Toggle"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Utility Functions"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Module 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Module 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Module 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Module 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Module 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Module 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Module 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Module 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Module 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Module 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Module 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Module 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Module 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Module 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Module 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Module 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Module 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Module 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Module 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Module 39"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Module 40"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Module 41"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Module 42"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Module 43"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Module 44"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Module 45"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Module 46"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Module 47"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Module 48"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Module 49"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Module 50"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Module 51"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Module 52"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Module 53"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "Module 54"
Cohesion: 1.0
Nodes (0): 

### Community 55 - "Module 55"
Cohesion: 1.0
Nodes (0): 

### Community 56 - "Module 56"
Cohesion: 1.0
Nodes (0): 

### Community 57 - "Module 57"
Cohesion: 1.0
Nodes (0): 

### Community 58 - "Module 58"
Cohesion: 1.0
Nodes (0): 

### Community 59 - "Module 59"
Cohesion: 1.0
Nodes (0): 

### Community 60 - "Module 60"
Cohesion: 1.0
Nodes (0): 

### Community 61 - "Module 61"
Cohesion: 1.0
Nodes (0): 

### Community 62 - "Module 62"
Cohesion: 1.0
Nodes (0): 

### Community 63 - "Module 63"
Cohesion: 1.0
Nodes (0): 

### Community 64 - "Module 64"
Cohesion: 1.0
Nodes (0): 

### Community 65 - "Module 65"
Cohesion: 1.0
Nodes (0): 

### Community 66 - "Module 66"
Cohesion: 1.0
Nodes (0): 

### Community 67 - "Module 67"
Cohesion: 1.0
Nodes (1): Arel Social (README)

## Knowledge Gaps
- **1 isolated node(s):** `Arel Social (README)`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `App Root Layout`** (2 nodes): `RootLayout()`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Home Page`** (2 nodes): `HomePage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Session Provider`** (2 nodes): `SessionProvider()`, `session-provider.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Theme Provider`** (2 nodes): `theme-provider.tsx`, `ThemeProvider()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Button Component`** (2 nodes): `cn()`, `button.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Label Component`** (2 nodes): `Label()`, `label.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Mode Toggle`** (2 nodes): `ModeToggle()`, `mode-toggle.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Utility Functions`** (2 nodes): `utils.ts`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 20`** (1 nodes): `eslint.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 21`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 22`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 23`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 24`** (1 nodes): `prisma.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 25`** (1 nodes): `auth.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 26`** (1 nodes): `proxy.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 27`** (1 nodes): `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 28`** (1 nodes): `input.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 29`** (1 nodes): `sheet.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 30`** (1 nodes): `browser.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 31`** (1 nodes): `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 32`** (1 nodes): `commonInputTypes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 33`** (1 nodes): `enums.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 34`** (1 nodes): `models.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 35`** (1 nodes): `prismaNamespace.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 36`** (1 nodes): `prismaNamespaceBrowser.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 37`** (1 nodes): `Account.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 38`** (1 nodes): `Comment.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 39`** (1 nodes): `CommentEditHistory.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 40`** (1 nodes): `CommentVote.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 41`** (1 nodes): `Community.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 42`** (1 nodes): `CommunityInvite.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 43`** (1 nodes): `CommunityMember.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 44`** (1 nodes): `CommunityModerator.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 45`** (1 nodes): `CommunityRestriction.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 46`** (1 nodes): `CommunityRule.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 47`** (1 nodes): `DirectMessage.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 48`** (1 nodes): `Event.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 49`** (1 nodes): `GlobalModerator.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 50`** (1 nodes): `Media.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 51`** (1 nodes): `ModLog.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 52`** (1 nodes): `Notification.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 53`** (1 nodes): `Post.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 54`** (1 nodes): `PostEditHistory.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 55`** (1 nodes): `PostFlair.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 56`** (1 nodes): `PostVote.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 57`** (1 nodes): `Report.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 58`** (1 nodes): `SavedComment.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 59`** (1 nodes): `SavedPost.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 60`** (1 nodes): `Session.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 61`** (1 nodes): `User.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 62`** (1 nodes): `UserBlock.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 63`** (1 nodes): `UserPreference.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 64`** (1 nodes): `prisma.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 65`** (1 nodes): `auth.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 66`** (1 nodes): `next-auth.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Module 67`** (1 nodes): `Arel Social (README)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `users (table)` connect `Auth & Community DB Schema` to `Content & Interactions Schema`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `posts (table)` connect `Content & Interactions Schema` to `Auth & Community DB Schema`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `Arel Social (README)` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._