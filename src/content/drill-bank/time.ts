import { b1, b2, c1, prefix } from './types';
export const timeAdditions = prefix('since-for-ago', {
  'since-year': [
    b1('sport', 'I have been a member of this running club ___ 2016.'),
    b2(
      'university',
      'The department has offered the course in English ___ 2022.',
    ),
    c1(
      'manufacturing',
      'The same traceability system has been in use ___ 2015, despite several changes in how production is organised.',
    ),
    b2('household', 'We have not replaced the kitchen windows ___ 2008.'),
  ],
  'since-day': [
    b1('household', 'The lift has been broken ___ Tuesday.'),
    b2(
      'office',
      'Have you heard anything from the supplier ___ last Thursday?',
    ),
    c1(
      'laboratory',
      'None of the samples received ___ 3 April has been exposed to the original storage conditions.',
    ),
    b2(
      'travel',
      'The ferry service has been suspended ___ Sunday because of the wind.',
    ),
  ],
  'since-event': [
    b2(
      'engineering',
      'The output has been noisy ___ we moved the signal cable closer to the drive.',
    ),
    b2(
      'social',
      'I have felt more settled ___ I joined the local sports club.',
    ),
    c1(
      'university',
      'My argument has changed considerably ___ the examiner pointed out that I was comparing unlike operating conditions.',
    ),
    c1(
      'manufacturing',
      'There have been fewer rejected parts ___ we introduced a check immediately after the tool change.',
    ),
  ],
  'since-time': [
    b2(
      'commuting',
      'I have been at the stop ___ 6:50, and no bus has appeared.',
    ),
    b2(
      'hospitality',
      'The guests have been waiting for their room ___ two o’clock.',
    ),
    c1(
      'laboratory',
      'The chamber has remained at the requested temperature ___ 14:30, so the conditioning period can now be assessed.',
    ),
    b2(
      'office',
      'She has been in back-to-back meetings ___ eight this morning.',
    ),
  ],
  'for-years': [
    b1('social', 'My brother has played the guitar ___ about five years.'),
    b2('university', 'Have you been studying part-time ___ the whole degree?'),
    c1(
      'engineering',
      'The supplier has supported this controller family ___ more than a decade, but future compatibility is no longer guaranteed.',
    ),
    b2('household', 'We have rented this flat ___ nearly eighteen months.'),
    b2('sport', 'She has coached junior players ___ several seasons now.'),
    c1(
      'manufacturing',
      'The line has operated without a major overhaul ___ eight years, which makes the maintenance records particularly important.',
    ),
    b2('office', 'I have known our new project manager ___ a long time.'),
    c1(
      'university',
      'How can a measurement method remain unchanged ___ so many years when the equipment around it has evolved so much?',
    ),
  ],
  'for-short': [
    b1('errands', 'I have been in this queue ___ almost an hour.'),
    b2(
      'engineering',
      'Leave the controller disconnected ___ thirty seconds before restarting it.',
    ),
    c1(
      'laboratory',
      'The sample must remain undisturbed ___ at least twelve hours before its final mass is recorded.',
    ),
    b2(
      'sport',
      'I have not trained properly ___ a couple of weeks because of my ankle.',
    ),
    b2(
      'office',
      'Could you cover the reception desk ___ ten minutes while I collect the visitors?',
    ),
    c1(
      'manufacturing',
      'We have monitored the bearing temperature ___ six consecutive shifts without observing the rise reported last week.',
    ),
    b2(
      'travel',
      'The connection was delayed ___ forty minutes, but we still reached the hotel before dinner.',
    ),
    b2(
      'household',
      'The paint should dry ___ a full day before we put the shelves back.',
    ),
  ],
  'for-finished': [
    b2(
      'university',
      'I studied abroad ___ one semester and then returned to finish my degree.',
    ),
    b2(
      'office',
      'She chaired the discussion ___ twenty minutes before handing over to the client.',
    ),
    c1(
      'manufacturing',
      'The line remained idle ___ most of the night while the team established whether the replacement part was safe to use.',
    ),
    b2(
      'travel',
      'We walked along the coast ___ three hours before turning inland.',
    ),
    b2(
      'sport',
      'He rested ___ a month after the injury and then resumed light training.',
    ),
    c1(
      'engineering',
      'The original configuration ran ___ two days before a fault appeared during a change in operating mode.',
    ),
    b2(
      'household',
      'The old fridge lasted ___ fifteen years before it finally stopped working.',
    ),
    c1(
      'laboratory',
      'Each specimen was loaded ___ exactly ninety seconds, after which the residual deformation was measured.',
    ),
  ],
  'ago-short': [
    b2(
      'office',
      'I uploaded the corrected agenda a few minutes ___; please use that version.',
    ),
    b2('commuting', 'The app showed the tram leaving thirty seconds ___.'),
    c1(
      'engineering',
      'The output returned to normal only moments ___, so we have not yet established whether the fault can recur.',
    ),
    b2(
      'household',
      'Someone rang the doorbell about ten minutes ___, but I was in the shower.',
    ),
    b2(
      'university',
      'The tutor answered my question an hour ___, after the seminar ended.',
    ),
    c1(
      'laboratory',
      'The balance was zeroed just a few seconds ___, yet the displayed offset is already increasing.',
    ),
    b2(
      'sport',
      'We finished the warm-up fifteen minutes ___ and are ready to start.',
    ),
    b2(
      'hospitality',
      'Your table became available a moment ___; please follow me.',
    ),
    c1(
      'manufacturing',
      'The interlock operated several minutes ___, before anyone had begun work inside the guarded area.',
    ),
    b2(
      'travel',
      'The boarding announcement was made half an hour ___, not just now.',
    ),
    b2(
      'social',
      'I sent the invitation only a minute ___, so do not worry if nobody has replied.',
    ),
    c1(
      'office',
      'The customer withdrew the request less than an hour ___, leaving us to decide whether the work already completed could be reused.',
    ),
    b2(
      'errands',
      'The shop closed twenty minutes ___, but the collection lockers are still accessible.',
    ),
  ],
  'ago-long': [
    b2(
      'university',
      'I chose my dissertation topic four months ___, before I understood how much data it required.',
    ),
    b2(
      'household',
      'We had the roof inspected two summers ___, after a particularly bad storm.',
    ),
    c1(
      'engineering',
      'The assumption was challenged several years ___, but the outdated version still appears in some internal notes.',
    ),
    b2('social', 'I met her at a language exchange about six months ___.'),
    b2(
      'manufacturing',
      'The company moved final assembly to this site three years ___.',
    ),
    c1(
      'laboratory',
      'A similar discrepancy was documented a decade ___, although the report did not identify a convincing explanation.',
    ),
    b2(
      'sport',
      'He completed his first marathon two years ___ and has run three more since then.',
    ),
    b2(
      'travel',
      'We last stayed at that hotel eighteen months ___, when the restaurant was being rebuilt.',
    ),
    c1(
      'office',
      'The agreement expired several weeks ___, so its terms should not be treated as authority for a new purchase.',
    ),
    b2(
      'commuting',
      'The new cycle bridge opened a year ___ and shortened my journey considerably.',
    ),
    b2(
      'errands',
      'I bought this kettle just over a month ___; it should still be under warranty.',
    ),
    c1(
      'university',
      'The original study was published twenty years ___, under conditions that differ substantially from those we are investigating.',
    ),
    c1(
      'household',
      'The previous owner replaced the wiring many years ___, but we cannot find any record of the final inspection.',
    ),
  ],
  'since-expressions': [
    b2(
      'social',
      'We exchanged phone numbers at the reunion and have stayed in touch ___ then.',
    ),
    b2(
      'engineering',
      'The actuator has failed twice ___ last month, despite the recent repair.',
    ),
    c1(
      'office',
      'The requirements have changed repeatedly ___ the beginning of the project, making the original estimate increasingly difficult to defend.',
    ),
    c1(
      'laboratory',
      'No comparable drift has been observed ___ the instrument was recalibrated at the start of this series.',
    ),
  ],
});
