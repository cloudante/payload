import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'

import { getPayload } from 'payload'
import config from '@/payload.config'
import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Define types for our lead gen page data
interface LeadGenPage {
  id: string
  title: string
  slug: string
  // Enhanced Hero Section
  heroSection: {
    headline: string
    subheadline: string
    description?: any // Rich text content
    image: {
      url: string
      alt: string
    }
    ctaText?: string
    ctaButtons?: Array<{
      text: string
      link: string
    }>
  }
  // Services Section
  servicesSection?: {
    title: string
    serviceItems: Array<{
      icon?: {
        url: string
        alt: string
      }
      title: string
      description: any // Rich text content
    }>
  }
  // Benefits (for backward compatibility)
  benefits?: Array<{
    title: string
    description: string
    icon?: {
      url: string
      alt: string
    }
  }>
  // Why Choose Us Section
  whyChooseUsSection?: {
    title: string
    features: Array<{
      icon?: {
        url: string
        alt: string
      }
      title: string
      description: any // Rich text content
    }>
  }
  // Features Section
  featuresSection?: {
    title: string
    features: Array<{
      title: string
      description: string
      image?: {
        url: string
        alt: string
      }
    }>
  }
  // Testimonials Section
  testimonialsSection?: {
    title: string
    testimonialsList: Array<{
      quote: any // Rich text content
      name: string
      position?: string
      company?: string
      avatar?: {
        url: string
        alt: string
      }
    }>
  }
  // Content Section
  contentSection?: {
    title: string
    content: any // Rich text content
  }
  // Contact Section
  contactSection?: {
    title: string
    generalInquiries?: {
      title: string
      content?: any
      email: string
    }
    billingInquiries?: {
      title: string
      content?: any
      email: string
    }
    terminalContacts?: {
      title: string
      content?: any
      linkText: string
      linkUrl: string
    }
  }
  generatedBy: string
  aiPrompt: string
  meta?: {
    title: string
    description: string
  }
}

// Helper function to get the payload instance
async function getPayloadClient() {
  const payload = await getPayload({
    config,
  })
  return payload
}

// This function generates the metadata for the page
export async function generateMetadata({
  params: { slug },
}: {
  params: { slug: string }
}): Promise<Metadata> {
  try {
    const payload = await getPayloadClient()

    // @ts-ignore - We know this collection exists even if TypeScript doesn't recognize it
    const result = await payload.find({
      collection: 'lead-gen-pages',
      where: {
        slug: {
          equals: slug,
        },
      },
      depth: 2,
    })

    if (!result.docs[0]) {
      return {
        title: 'Page Not Found',
        description: 'The page you are looking for does not exist.',
      }
    }

    const page = result.docs[0] as unknown as LeadGenPage

    return {
      title: page.meta?.title || page.title,
      description: page.meta?.description,
    }
  } catch (error) {
    console.error('Error fetching page metadata:', error)
    return {
      title: 'Error',
      description: 'There was an error loading this page',
    }
  }
}

// Generate static params for all lead gen pages
export async function generateStaticParams() {
  try {
    const payload = await getPayloadClient()

    // @ts-ignore - We know this collection exists even if TypeScript doesn't recognize it
    const result = await payload.find({
      collection: 'lead-gen-pages',
      limit: 100,
    })

    return result.docs.map((page: any) => ({
      slug: page.slug,
    }))
  } catch (error) {
    console.error('Error fetching static params:', error)
    return []
  }
}

export default async function LeadGenPage({ params: { slug } }: { params: { slug: string } }) {
  try {
    console.log('Attempting to fetch lead gen page with slug:', slug)

    const payload = await getPayloadClient()

    // Check Payload Connection
    try {
      // Just try a simple connection check
      const testResult = await payload.find({
        collection: 'users',
        limit: 1,
      })
      console.log('Payload connection check successful')
    } catch (connError) {
      console.error('Payload connection test failed:', connError)
    }

    // Try to list all available collections
    try {
      console.log('Available collections:', Object.keys(payload.collections))
    } catch (err) {
      console.error('Could not list collections:', err)
    }

    // @ts-ignore - We know this collection exists even if TypeScript doesn't recognize it
    const result = await payload.find({
      collection: 'lead-gen-pages',
      where: {
        slug: {
          equals: slug,
        },
      },
      depth: 2,
    })

    console.log('Query result:', JSON.stringify(result, null, 2))

    const leadGenPage = result.docs[0] as unknown as LeadGenPage

    if (!leadGenPage) {
      console.log('No lead gen page found with slug:', slug)
      return notFound()
    }

    const {
      title,
      heroSection,
      benefits,
      servicesSection,
      whyChooseUsSection,
      featuresSection,
      testimonialsSection,
      contentSection,
      contactSection,
    } = leadGenPage

    return (
      <div className="flex flex-col w-full bg-background">
        {/* Header/Navigation */}
        <header className="border-b">
          <div className="container flex justify-between items-center h-16 px-4">
            <div className="flex items-center">
              {/* UNIS Logo - Replace with your own logo */}
              <svg
                width="55"
                height="20"
                viewBox="0 0 55 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-auto"
              >
                <path
                  d="M3.23427 14.2518C3.23427 16.1373 4.41172 17.3602 6.47966 17.3602C8.54574 17.3602 9.71393 16.1373 9.71393 14.2518V5.22266H12.9482V14.5478C12.9482 17.799 10.4322 19.9998 6.47966 19.9998C2.52707 19.9998 0 17.799 0 14.5478V5.22266H3.23427V14.2518Z"
                  fill="#E1261C"
                ></path>
                <path
                  d="M26.0417 10.5991C26.0417 8.71366 24.8642 7.49074 22.7963 7.49074C20.7302 7.49074 19.562 8.71366 19.562 10.5991V19.6283H16.3296V10.3031C16.3296 7.05197 18.8455 4.85107 22.7981 4.85107C26.7489 4.85107 29.2759 7.05197 29.2759 10.3031V19.6283H26.0417V10.5991Z"
                  fill="#00833E"
                ></path>
                <path d="M32.4302 19.6286V5.22852H35.6645V19.6286H32.4302Z" fill="#238DC1"></path>
                <path
                  d="M32.1968 1.7445C32.1968 0.770049 33.041 0 34.0518 0C35.0645 0 35.8957 0.770049 35.8957 1.7445C35.8957 2.70839 35.0626 3.47844 34.0518 3.47844C33.041 3.47844 32.1968 2.70662 32.1968 1.7445Z"
                  fill="#238DC1"
                ></path>
                <path
                  d="M46.187 11.2352L44.3245 10.8652C42.5139 10.4951 41.7752 9.96475 41.7752 9.05373C41.7752 7.92244 42.8453 7.19292 44.4634 7.19292C46.0222 7.19292 47.1534 7.95768 47.3089 9.13126C47.32 9.21408 47.3311 9.348 47.3311 9.46959H50.3543C50.3543 9.46959 50.3543 9.30571 50.3525 9.17179V9.14183C50.2562 6.59027 47.8476 4.81934 44.4412 4.81934C40.8755 4.81934 38.5299 6.60085 38.5299 9.29161C38.5299 11.4819 39.9109 12.8335 42.7268 13.3938L44.7392 13.8044C46.635 14.1939 47.4051 14.7454 47.4051 15.6952C47.4051 16.8159 46.2166 17.6053 44.5356 17.6053C42.7157 17.6053 41.4513 16.8353 41.3013 15.6335C41.2809 15.4873 41.2828 15.3199 41.2828 15.3199H38.167L38.1725 15.5525L38.1818 15.7234C38.3503 18.3419 40.7237 19.9948 44.3634 19.9948C48.2401 19.9948 50.6283 18.2133 50.6283 15.3322C50.6302 13.1066 49.2916 11.8555 46.187 11.2352Z"
                  fill="#F8BE00"
                ></path>
              </svg>
            </div>
            <Button variant="default" size="sm" className="rounded-full">
              Sign In
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex justify-center items-center py-16 px-4 md:px-16 lg:px-40 self-stretch bg-background">
          <div className="grid gap-10 md:grid-cols-2 items-center w-full max-w-7xl">
            <div className="flex flex-col items-start gap-8 max-w-xl">
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-700">{heroSection?.subheadline}</p>

                <h1 className="text-5xl font-bold tracking-tight leading-tight">
                  {heroSection?.headline}
                </h1>

                {heroSection?.description && (
                  <p className="text-lg text-gray-600 mt-6">{heroSection.description}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                {heroSection?.ctaText && (
                  <Button
                    size="lg"
                    className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-6"
                  >
                    {heroSection.ctaText}
                  </Button>
                )}

                {heroSection?.ctaButtons &&
                  heroSection.ctaButtons.map((button, index) => (
                    <Button
                      key={index}
                      variant={index === 0 ? 'default' : 'outline'}
                      size="lg"
                      className={`rounded-full px-6 ${index === 0 ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'border-gray-300 text-gray-700'}`}
                      asChild
                    >
                      <Link href={button.link}>{button.text}</Link>
                    </Button>
                  ))}
              </div>
            </div>

            <div className="hidden md:block h-[504px] rounded-2xl bg-gray-100 overflow-hidden relative">
              {heroSection?.image ? (
                <Image
                  src={heroSection.image.url}
                  alt={heroSection.image.alt || 'Logistics services'}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-100"></div>
              )}
            </div>
          </div>
        </section>

        {/* Services Section - Using either servicesSection or benefits */}
        {(servicesSection || (benefits && benefits.length > 0)) && (
          <section className="flex flex-col w-full max-w-[1400px] mx-auto py-10 px-4 md:px-40 justify-center items-center gap-10 bg-white">
            <div className="flex flex-col items-center gap-10 self-stretch">
              <h2 className="text-3xl font-bold tracking-tight text-center sm:text-4xl md:text-5xl">
                {servicesSection?.title || 'Our Services'}
              </h2>
              <div className="w-20 h-1 bg-blue-500"></div>

              <div className="grid gap-10 md:grid-cols-3 w-full">
                {servicesSection?.serviceItems
                  ? servicesSection.serviceItems.map((service, index) => (
                      <div key={index} className="flex flex-col items-start gap-5 flex-1">
                        <div className="flex flex-col items-start gap-5 w-full">
                          {service.icon && (
                            <div className="w-12 h-12 bg-blue-50 p-2 rounded-full flex items-center justify-center">
                              <Image
                                src={service.icon.url}
                                alt={service.icon.alt || service.title}
                                width={32}
                                height={32}
                              />
                            </div>
                          )}
                          <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                        </div>
                        <div className="text-gray-600">
                          {typeof service.description === 'string' ? (
                            <div dangerouslySetInnerHTML={{ __html: service.description }} />
                          ) : (
                            <div>
                              {service.description &&
                                service.description.root &&
                                service.description.root.children.map(
                                  (paragraph: any, i: number) => {
                                    if (paragraph.children) {
                                      return (
                                        <p key={i} className="mb-2">
                                          {paragraph.children.map((textNode: any, j: number) =>
                                            textNode.text ? textNode.text : null,
                                          )}
                                        </p>
                                      )
                                    }
                                    return null
                                  },
                                )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  : benefits &&
                    benefits.map(
                      (
                        benefit: {
                          title: string
                          description: string
                          icon?: { url: string; alt: string }
                        },
                        index: number,
                      ) => (
                        <div key={index} className="flex flex-col items-start gap-5 flex-1">
                          <div className="flex flex-col items-start gap-5 w-full">
                            {benefit.icon && (
                              <div className="w-12 h-12 bg-blue-50 p-2 rounded-full flex items-center justify-center">
                                <Image
                                  src={benefit.icon.url}
                                  alt={benefit.icon.alt || benefit.title}
                                  width={32}
                                  height={32}
                                />
                              </div>
                            )}
                            <h3 className="text-xl font-bold text-gray-900">{benefit.title}</h3>
                          </div>
                          <p className="text-gray-600">
                            {typeof benefit.description === 'string'
                              ? benefit.description
                              : 'No description available'}
                          </p>
                        </div>
                      ),
                    )}
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        {featuresSection && featuresSection.features && featuresSection.features.length > 0 && (
          <section className="container py-12 md:py-24 lg:py-32">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {featuresSection.title}
              </h2>
              <div className="w-20 h-1 bg-primary mx-auto mt-4"></div>
            </div>
            <div className="space-y-12">
              {featuresSection.features.map(
                (
                  feature: {
                    title: string
                    description: string
                    image?: { url: string; alt: string }
                  },
                  i: number,
                ) => (
                  <Card key={i} className="overflow-hidden border shadow-sm">
                    <div className="grid md:grid-cols-2 gap-6">
                      {i % 2 === 0 ? (
                        <>
                          <CardContent className="p-6 flex items-center">
                            <div>
                              <CardTitle className="text-2xl mb-4">{feature.title}</CardTitle>
                              <CardDescription className="text-base">
                                {feature.description}
                              </CardDescription>
                              <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground mt-4">
                                Feature {i + 1}
                              </span>
                            </div>
                          </CardContent>
                          <div className="bg-muted flex items-center justify-center p-6">
                            {feature.image && (
                              <Image
                                src={feature.image.url}
                                alt={feature.image.alt || feature.title}
                                width={400}
                                height={300}
                                className="rounded-md object-cover"
                              />
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-muted flex items-center justify-center p-6 md:order-2">
                            {feature.image && (
                              <Image
                                src={feature.image.url}
                                alt={feature.image.alt || feature.title}
                                width={400}
                                height={300}
                                className="rounded-md object-cover"
                              />
                            )}
                          </div>
                          <CardContent className="p-6 flex items-center">
                            <div>
                              <CardTitle className="text-2xl mb-4">{feature.title}</CardTitle>
                              <CardDescription className="text-base">
                                {feature.description}
                              </CardDescription>
                              <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground mt-4">
                                Feature {i + 1}
                              </span>
                            </div>
                          </CardContent>
                        </>
                      )}
                    </div>
                  </Card>
                ),
              )}
            </div>
          </section>
        )}

        {/* Content Section */}
        {contentSection && (
          <section className="container py-12 md:py-24 lg:py-32">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl">{contentSection.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  {contentSection.content ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          typeof contentSection.content === 'string'
                            ? contentSection.content
                            : JSON.stringify(contentSection.content),
                      }}
                    />
                  ) : (
                    <p>No content available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Contact Section */}
        {contactSection && (
          <section className="py-16 bg-blue-500 text-white">
            <div className="container mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                <div className="space-y-8">
                  <h2 className="text-4xl font-bold">{contactSection.title || 'Contact Us'}</h2>

                  <div className="space-y-6">
                    {contactSection.generalInquiries && (
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-200">
                          {contactSection.generalInquiries.title}
                        </h3>
                        <p className="mt-2">
                          Please send us an email to {contactSection.generalInquiries.email} or
                          start a conversation using the form on the right.
                        </p>
                      </div>
                    )}

                    {contactSection.billingInquiries && (
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-200">
                          {contactSection.billingInquiries.title}
                        </h3>
                        <p className="mt-2">
                          Please email us at{' '}
                          <a
                            href={`mailto:${contactSection.billingInquiries.email}`}
                            className="underline"
                          >
                            {contactSection.billingInquiries.email}
                          </a>{' '}
                          for support.
                        </p>
                      </div>
                    )}

                    {contactSection.terminalContacts && (
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-200">
                          {contactSection.terminalContacts.title}
                        </h3>
                        <p className="mt-2">
                          Please{' '}
                          <a href={contactSection.terminalContacts.linkUrl} className="underline">
                            {contactSection.terminalContacts.linkText}
                          </a>{' '}
                          to view a comprehensive list of terminal contacts.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-lg text-gray-800">
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-gray-700">
                          First Name
                        </Label>
                        <Input id="firstName" placeholder="Placeholder" className="mt-1" />
                        <p className="text-xs text-gray-500 mt-1">This is an input description.</p>
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-gray-700">
                          Last Name
                        </Label>
                        <Input id="lastName" placeholder="Placeholder" className="mt-1" />
                        <p className="text-xs text-gray-500 mt-1">This is an input description.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="jobTitle" className="text-gray-700">
                          Job Title
                        </Label>
                        <Input id="jobTitle" placeholder="Placeholder" className="mt-1" />
                        <p className="text-xs text-gray-500 mt-1">This is an input description.</p>
                      </div>
                      <div>
                        <Label htmlFor="phoneNumber" className="text-gray-700">
                          Phone Number
                        </Label>
                        <Input id="phoneNumber" placeholder="Placeholder" className="mt-1" />
                        <p className="text-xs text-gray-500 mt-1">This is an input description.</p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-gray-700">
                        Email
                      </Label>
                      <Input id="email" type="email" placeholder="Placeholder" className="mt-1" />
                      <p className="text-xs text-gray-500 mt-1">This is an input description.</p>
                    </div>

                    <div>
                      <Label htmlFor="companyName" className="text-gray-700">
                        Company Name
                      </Label>
                      <Input id="companyName" placeholder="Placeholder" className="mt-1" />
                      <p className="text-xs text-gray-500 mt-1">This is an input description.</p>
                    </div>

                    <div>
                      <Label htmlFor="inquiryType" className="text-gray-700">
                        Type of Inquiry
                      </Label>
                      <Select defaultValue="">
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Placeholder" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="support">Support</SelectItem>
                          <SelectItem value="billing">Billing</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">This is an input description.</p>
                    </div>

                    <div>
                      <Label htmlFor="inquiryDetail" className="text-gray-700">
                        Inquiry Detail
                      </Label>
                      <Textarea
                        id="inquiryDetail"
                        placeholder="Placeholder"
                        className="mt-1"
                        rows={4}
                      />
                      <p className="text-xs text-gray-500 mt-1">This is a text area description.</p>
                    </div>

                    <Button
                      type="submit"
                      className="w-auto bg-blue-500 hover:bg-blue-600 text-white rounded-full px-8 py-2 flex items-center"
                    >
                      Submit
                      <span className="ml-2 w-5 h-5 rounded-full border border-white flex items-center justify-center text-xs">
                        →
                      </span>
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer CTA Section */}
        <section className="bg-primary text-primary-foreground">
          <div className="container py-12 md:py-24 lg:py-32">
            <div className="text-center max-w-md mx-auto">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to get started?</h2>
              <p className="mb-6">Contact us today to learn how we can help grow your business.</p>
              <Button variant="secondary" size="lg" className="rounded-full">
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      </div>
    )
  } catch (error) {
    console.error('Error loading lead gen page:', error)
    return notFound()
  }
}
