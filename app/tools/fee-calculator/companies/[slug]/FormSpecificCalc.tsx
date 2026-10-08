'use client'

import React from 'react'
import { MCAForm } from '@/data/mca-forms'
import ADT1Workspace from './ADT1Workspace'
import CHG1Workspace from './CHG1Workspace'
import MGT7Workspace from './MGT7Workspace'
import AOC4Workspace from './AOC4Workspace'
import DPT3Workspace from './DPT3Workspace'
import DIR3KYCWorkspace from './DIR3KYCWorkspace'
import DIR12Workspace from './DIR12Workspace'
import INC20AWorkspace from './INC20AWorkspace'
import SPICePlusWorkspace from './SPICePlusWorkspace'
import PAS6Workspace from './PAS6Workspace'
import MSME1Workspace from './MSME1Workspace'
import PAS3Workspace from './PAS3Workspace'
import SH7Workspace from './SH7Workspace'
import MGT14Workspace from './MGT14Workspace'
import GenericFormWorkspace from './GenericFormWorkspace'

export default function FormSpecificCalc({ form }: { form: MCAForm }) {
  if (form.slug === 'dpt-3') {
    return <DPT3Workspace form={form} />
  }

  if (form.slug === 'adt-1') {
    return <ADT1Workspace form={form} />
  }

  if (form.slug === 'chg-1') {
    return <CHG1Workspace form={form} />
  }

  if (form.slug === 'mgt-7' || form.slug === 'mgt-7a') {
    return <MGT7Workspace form={form} />
  }

  if (form.slug === 'aoc-4' || form.slug.startsWith('aoc-4')) {
    return <AOC4Workspace form={form} />
  }

  if (form.slug === 'dir-3-kyc' || form.slug === 'dir-3') {
    return <DIR3KYCWorkspace form={form} />
  }

  if (form.slug === 'dir-12' || form.slug === 'dir12') {
    return <DIR12Workspace form={form} />
  }

  if (form.slug === 'inc-20a' || form.slug === 'inc20a') {
    return <INC20AWorkspace form={form} />
  }

  if (form.slug === 'spice-plus' || form.slug === 'inc-32' || form.slug === 'spice') {
    return <SPICePlusWorkspace form={form} />
  }

  if (form.slug === 'pas-6' || form.slug === 'pas6') {
    return <PAS6Workspace form={form} />
  }

  if (form.slug === 'msme-1' || form.slug === 'msme1') {
    return <MSME1Workspace form={form} />
  }

  if (form.slug === 'pas-3' || form.slug === 'pas3') {
    return <PAS3Workspace form={form} />
  }

  if (form.slug === 'sh-7' || form.slug === 'sh7') {
    return <SH7Workspace form={form} />
  }

  if (form.slug === 'mgt-14' || form.slug === 'mgt14') {
    return <MGT14Workspace form={form} />
  }

  return <GenericFormWorkspace form={form} />
}
