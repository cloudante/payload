import type { CollectionConfig } from 'payload'
import { admins } from '../../access/admins'
import { defaultLexical } from '../../fields/defaultLexical'
// Import the admin component but don't use it directly
// eslint-disable-next-line
import './LeadGenPagesAdmin'

export const LeadGenPages: CollectionConfig = {
  slug: 'lead-gen-pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'createdAt'],
    group: 'Content',
    // We'll let Payload handle the component registration via the importMap
  },
  access: {
    read: () => true,
    create: admins,
    update: admins,
    delete: admins,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    // Enhanced Hero Section
    {
      name: 'heroSection',
      type: 'group',
      fields: [
        {
          name: 'headline',
          type: 'text',
          required: true,
        },
        {
          name: 'subheadline',
          type: 'text',
        },
        {
          name: 'description',
          type: 'richText',
          editor: defaultLexical,
        },
        {
          name: 'ctaButtons',
          type: 'array',
          fields: [
            {
              name: 'text',
              type: 'text',
              required: true,
            },
            {
              name: 'link',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'ctaText',
          type: 'text',
          label: 'Call to Action Text',
        },
      ],
    },
    // Services Section (Enhanced Benefits)
    {
      name: 'servicesSection',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'serviceItems',
          type: 'array',
          fields: [
            {
              name: 'icon',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'richText',
              editor: defaultLexical,
            },
          ],
        },
      ],
    },
    // Keeping the original benefits for backward compatibility
    // Why Choose Us Section

    // Enhanced Contact Section
    {
      name: 'contactSection',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          defaultValue: 'Contact Us',
        },
        {
          name: 'generalInquiries',
          type: 'group',
          fields: [
            {
              name: 'title',
              type: 'text',
              defaultValue: 'GENERAL INQUIRIES',
            },
            {
              name: 'content',
              type: 'richText',
              editor: defaultLexical,
            },
            {
              name: 'email',
              type: 'text',
              defaultValue: 'info@unisco.com',
            },
          ],
        },
        {
          name: 'billingInquiries',
          type: 'group',
          fields: [
            {
              name: 'title',
              type: 'text',
              defaultValue: 'BILLING INQUIRIES',
            },
            {
              name: 'content',
              type: 'richText',
              editor: defaultLexical,
            },
            {
              name: 'email',
              type: 'text',
              defaultValue: 'payables.support@unisco.com',
            },
          ],
        },
        {
          name: 'terminalContacts',
          type: 'group',
          fields: [
            {
              name: 'title',
              type: 'text',
              defaultValue: 'TERMINAL CONTACTS',
            },
            {
              name: 'content',
              type: 'richText',
              editor: defaultLexical,
            },
            {
              name: 'linkText',
              type: 'text',
              defaultValue: 'click here',
            },
            {
              name: 'linkUrl',
              type: 'text',
              defaultValue: '#',
            },
          ],
        },
      ],
    },
    {
      name: 'generatedBy',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'aiPrompt',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        description: 'The original prompt used to generate this page',
      },
    },
    {
      name: 'meta',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
