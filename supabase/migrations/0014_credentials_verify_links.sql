-- ════════════════════════════════════════════════════════════════════════════
--  THE VERIFY LINKS ACTUALLY GO SOMEWHERE
--
--  0013 pointed the Ontario link at ontario.ca/page/search-business-name,
--  which is a 404 -- the page was retired when the Ontario Business Registry
--  replaced it. A "Verify" button that lands on "We can't find that page" is
--  worse than no button at all: it reads as a company that made the
--  registration up.
--
--  All three links were re-checked by request before this was written:
--
--    appmybizaccount.gov.on.ca .. registerItemSearch   302  (search form)
--    dnb.com/duns-number/lookup.html                   200  -> my.dnb.com/lookup
--    fcci.com.pk                                       200
--
--  The Ontario link goes straight to the registry search form rather than to
--  the ontario.ca page about the registry. It is the entry.pub URL Ontario
--  publishes for that purpose -- NOT a view.pub?id=...&_timestamp=... URL
--  copied from the address bar. Those carry a session instance id: they work
--  for whoever opened them and fail for everyone else, which is the same
--  broken-link problem wearing a different hat.
--
--  Each block also gains the status badge and the footnote that tell a buyer
--  exactly what to type into the register once they get there -- the number on
--  its own is no use if they do not know which field it goes in.
--
--  Re-runnable.
-- ════════════════════════════════════════════════════════════════════════════

begin;

update public."PageSection"
   set data = '{
  "eyebrow": "Registered And Verifiable",
  "heading": "Who Says So",
  "description": "A buyer sending money to a supplier they have not met is really asking two questions: does this company exist where it says it does, and has anyone independent confirmed it. Below are the answers, each with the number you can check it against — in the registry, not on our word.",
  "items": [
    {
      "badge": "Verified Registration",
      "name": "Registered in Ontario, Canada",
      "issuer": "Ministry of Public and Business Service Delivery, Province of Ontario",
      "summary": "Held by 13615464 Canada Inc., Mian Umair International is a registered business name in the Province of Ontario under the Business Names Act. This is what lets us invoice and contract from Canada for North American buyers.",
      "details": [
        "Business name: Mian Umair International",
        "Business ID (BIN): 1001508838",
        "Registrant: 13615464 Canada Inc.",
        "Issued by: Ontario Ministry of Public and Business Service Delivery",
        "Effective: February 19, 2026",
        "Expires: February 18, 2031"
      ],
      "image": "https://bdkqflbabuxykdhmwxnc.supabase.co/storage/v1/object/public/products/certificates/ontario-business-registration.jpg",
      "verifyUrl": "https://www.appmybizaccount.gov.on.ca/onbis/master/entry.pub?applicationCode=onbis-master&businessService=registerItemSearch",
      "verifyLabel": "Verify on Ontario registry",
      "note": "The link opens the Ontario Business Registry search. Enter BIN 1001508838, or the business name, to confirm this registration."
    },
    {
      "badge": "Active In The D&B Database",
      "name": "D-U-N-S Registered",
      "issuer": "Dun & Bradstreet",
      "summary": "A D-U-N-S number is the identifier banks, insurers and large buyers use to pull an independent file on a supplier. Ours is live in the D&B database, so a purchasing department can run its own check on us without asking us for anything first.",
      "details": [
        "D-U-N-S number: 75-337-5748",
        "Registered to: Mian Umair International",
        "Issued: September 15, 2026",
        "Registry: Dun & Bradstreet global database"
      ],
      "image": "https://bdkqflbabuxykdhmwxnc.supabase.co/storage/v1/object/public/products/certificates/duns-number.jpg",
      "verifyUrl": "https://www.dnb.com/duns-number/lookup.html",
      "verifyLabel": "Look up our D-U-N-S",
      "note": "Search the D&B lookup for Mian Umair International, or enter D-U-N-S 75-337-5748 directly."
    },
    {
      "badge": "Member Since 2019",
      "name": "Faisalabad Chamber of Commerce",
      "issuer": "The Faisalabad Chamber of Commerce & Industry — affiliated with the Federation of Pakistan Chambers of Commerce & Industry",
      "summary": "Associate Class membership of the Faisalabad Chamber, held without a break since 2019. The Chamber is what attests export documents and certificates of origin, which is why most importing customs authorities expect a Pakistani supplier to be a member.",
      "details": [
        "Membership number: 2112241-10244",
        "Class: Associate",
        "Member since: November 12, 2019",
        "Valid until: March 31, 2027",
        "NTN: 0950057-0",
        "GST: 32-77-8761-810-08"
      ],
      "image": "https://bdkqflbabuxykdhmwxnc.supabase.co/storage/v1/object/public/products/certificates/chamber-of-commerce-membership.jpg",
      "verifyUrl": "https://fcci.com.pk/",
      "verifyLabel": "Faisalabad Chamber of Commerce",
      "note": "Membership can be confirmed with the Chamber against membership number 2112241-10244. The national identity number printed on the certificate is blacked out here on purpose."
    }
  ]
}'::jsonb
 where type = 'CREDENTIALS'
   and "pageId" = (select id from public."Page" where slug = '/certifications');

commit;
