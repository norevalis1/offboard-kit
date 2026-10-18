// Checklist steps per system. Each system has onboarding and offboarding steps.
// {name} is replaced with the employee's name when the checklist is generated.
const SYSTEMS = [
  {
    id: "m365",
    label: "Microsoft 365 / Entra ID",
    onboarding: [
      "Create user account for {name} in Microsoft 365 admin center",
      "Assign the correct license (e.g. Business Standard / E3)",
      "Add to security and distribution groups for their department",
      "Require MFA registration at first sign-in",
      "Set up mailbox signature, time zone and language",
      "Grant access to shared mailboxes and Teams channels",
    ],
    offboarding: [
      "Block sign-in for {name} in Entra ID",
      "Revoke all active sessions (Revoke-MgUserSignInSession or admin center)",
      "Reset password and remove MFA methods",
      "Convert mailbox to shared mailbox or set up forwarding to manager",
      "Set an out-of-office reply pointing to the new contact",
      "Transfer OneDrive files to manager (admin center > Users > OneDrive)",
      "Remove from groups, Teams and distribution lists",
      "Remove license once mailbox and data are handled",
    ],
  },
  {
    id: "google",
    label: "Google Workspace",
    onboarding: [
      "Create user {name} in Google Admin console",
      "Place in the correct organizational unit",
      "Enforce 2-Step Verification",
      "Add to Google Groups and shared drives",
      "Share relevant calendars and resources",
    ],
    offboarding: [
      "Suspend {name}'s account in Google Admin",
      "Reset password and sign out of all sessions",
      "Revoke app passwords and OAuth tokens",
      "Transfer Drive files and calendar events to manager (Data transfer tool)",
      "Set up email routing or delegate mailbox to manager",
      "Remove from groups and shared drives",
      "Delete or archive the account and release the license",
    ],
  },
  {
    id: "ad",
    label: "On-prem Active Directory",
    onboarding: [
      "Create AD account for {name} in the correct OU",
      "Add to department security groups",
      "Map home drive and department file shares",
      "Confirm account syncs to the cloud (if using Entra Connect)",
    ],
    offboarding: [
      "Disable {name}'s AD account",
      "Reset password",
      "Remove from security groups (record membership first)",
      "Move account to the Disabled Users OU",
      "Archive home drive to manager or backup location",
      "Note a date to delete the account (e.g. 30-90 days)",
    ],
  },
  {
    id: "slack",
    label: "Slack",
    onboarding: [
      "Invite {name} to the Slack workspace",
      "Add to team and project channels",
    ],
    offboarding: [
      "Deactivate {name}'s Slack account",
      "Transfer ownership of any channels or workflows they own",
    ],
  },
  {
    id: "vpn",
    label: "VPN / remote access",
    onboarding: [
      "Create VPN account or add {name} to the VPN group",
      "Send VPN client install instructions",
      "Test a remote connection with the user",
    ],
    offboarding: [
      "Disable {name}'s VPN access",
      "Revoke VPN certificates or tokens",
      "Remove from remote desktop / jump host groups",
    ],
  },
  {
    id: "hardware",
    label: "Laptop / hardware",
    onboarding: [
      "Assign laptop and record serial number against {name}",
      "Enroll device in management (Intune, Jamf, etc.)",
      "Install standard software image and updates",
      "Confirm disk encryption (BitLocker / FileVault) is on",
      "Hand over peripherals (monitor, dock, headset) and record them",
    ],
    offboarding: [
      "Collect laptop and peripherals from {name}",
      "Check returned items against the asset record",
      "Back up any needed local data",
      "Wipe and re-image the device, or retire it in device management",
      "Update asset inventory status",
    ],
  },
  {
    id: "phone",
    label: "Phone / mobile devices",
    onboarding: [
      "Set up desk phone or softphone extension for {name}",
      "Enroll company mobile device in MDM",
    ],
    offboarding: [
      "Remote-wipe company data from {name}'s mobile devices",
      "Reassign or disable phone extension and voicemail",
      "Port or cancel company mobile number",
    ],
  },
  {
    id: "badge",
    label: "Building access / badges",
    onboarding: [
      "Issue access badge for {name} with the correct door groups",
      "Add to alarm system codes if needed",
    ],
    offboarding: [
      "Deactivate {name}'s badge and collect it",
      "Remove alarm codes and return any physical keys",
    ],
  },
  {
    id: "shared",
    label: "Shared passwords / password manager",
    onboarding: [
      "Invite {name} to the password manager",
      "Share the vaults or folders their role needs",
    ],
    offboarding: [
      "Remove {name} from the password manager",
      "Rotate shared passwords they had access to (Wi-Fi, admin accounts, vendors)",
    ],
  },
  {
    id: "saas",
    label: "Other SaaS apps (CRM, accounting, etc.)",
    onboarding: [
      "List the SaaS apps {name}'s role needs and create accounts",
      "Use SSO where available instead of separate passwords",
    ],
    offboarding: [
      "Remove {name} from each SaaS app (check SSO app list for anything missed)",
      "Transfer ownership of records, reports or dashboards they own",
      "Cancel or reassign paid seats",
    ],
  },
];

// Steps that apply no matter which systems are chosen.
const GENERAL = {
  onboarding: [
    "Confirm start date, role and manager for {name} with HR",
    "Have {name} sign the acceptable use policy",
    "Walk {name} through how to contact IT support",
  ],
  offboarding: [
    "Confirm last day and access cut-off time for {name} with HR",
    "Agree with the manager where {name}'s files and email should go",
    "Record when each step was completed for audit purposes",
  ],
};
