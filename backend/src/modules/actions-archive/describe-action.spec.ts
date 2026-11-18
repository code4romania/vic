import { describeAction } from './describe-action';

// #683: the backup writes the action history as the web shows it.
describe('describeAction', () => {
  it('names the action and fills in its sentence', () => {
    expect(
      describeAction('CHANGE_VOLUNTEER_STATUS', {
        volunteerName: 'Mario Test',
        oldStatus: 'inactive',
        newStatus: 'active',
      }),
    ).toEqual({
      label: 'Modifică Status Voluntar',
      text: 'Statusul pentru voluntarul Mario Test a fost schimbat din inactiv în activ.',
    });
  });

  it('translates the old "archived" volunteer status', () => {
    expect(
      describeAction('CHANGE_VOLUNTEER_STATUS', {
        volunteerName: 'Mario Test',
        oldStatus: 'archived',
        newStatus: 'active',
      }).text,
    ).toContain('din arhivat în activ');
  });

  it('picks the structure kind and the activity log status', () => {
    expect(
      describeAction('DELETE_ORGANIZATION_STRUCTURE', {
        organizationStructureName: 'QA Dept',
        organizationStructureType: 'department',
      }).text,
    ).toContain('QA Dept');
    expect(
      describeAction('UPDATE_ORGANIZATION_STRUCTURE', {
        organizationStructureType: 'branch',
        changes: { name: { original: 'Cluj', updated: 'Cluj-Napoca' } },
      }).text,
    ).toMatch(/Cluj.*Cluj-Napoca/);
    const approved = describeAction('CHANGE_ACTIVITY_LOG_STATUS', {
      newStatus: 'approved',
      volunteerName: 'Ana',
    });
    const rejected = describeAction('CHANGE_ACTIVITY_LOG_STATUS', {
      newStatus: 'rejected',
      volunteerName: 'Ana',
    });
    expect(approved.text).not.toEqual(rejected.text);
    expect(approved.text).not.toMatch(/{{|<inlineLink>/);
  });

  it('uses the status names of activity types, events and announcements', () => {
    expect(
      describeAction('CHANGE_ACTIVITY_TYPE_STATUS', {
        activityTypeName: 'Mentorat',
        oldStatus: 'active',
        newStatus: 'archived',
      }).text,
    ).toContain('din activă în arhivată');
  });

  it('keeps an action it does not know as its code and JSON', () => {
    expect(describeAction('SOMETHING_NEW', { a: 1 })).toEqual({
      label: 'SOMETHING_NEW',
      text: '{"a":1}',
    });
  });

  it('never leaves a placeholder or a tag in any known action', () => {
    const { ACTION_TEXTS } = jest.requireActual('./actions-archive.texts.ro');
    Object.keys(ACTION_TEXTS).forEach((eventName) => {
      const { text } = describeAction(eventName, {
        organizationStructureType: 'role',
        newStatus: 'approved',
      });
      expect(text).not.toMatch(/{{|}}|<\/?inlineLink>/);
    });
  });
});
