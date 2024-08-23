import { DateTime } from "luxon";
import Timeline from "@/components/Timeline";

export default function Events() {
  const items = [
    {
      id: 1,
      content: 'Natus Vincere VS Astralis',
      start: DateTime.now().minus({ hours: 3 }).toJSDate(),
      end: DateTime.now().minus({ hours: 1 }).toJSDate()
    },
    {
      id: 2,
      content: 'G2 Esports VS Fnatic',
      start: DateTime.now().minus({ hours: 2 }).toJSDate(),
      end: DateTime.now().plus({ hours: 1 }).toJSDate()
    },
    {
      id: 3,
      content: 'Team Liquid VS Virtus.pro',
      start: DateTime.now().minus({ hours: 1 }).toJSDate(),
      end: DateTime.now().plus({ hours: 2 }).toJSDate()
    },
    {
      id: 4,
      content: 'FaZe Clan VS MIBR',
      start: DateTime.now().plus({ hours: 1 }).toJSDate(),
      end: DateTime.now().plus({ hours: 3 }).toJSDate()
    },
    {
      id: 5,
      content: 'Ninjas in Pyjamas VS Team Vitality',
      start: DateTime.now().plus({ hours: 2 }).toJSDate(),
      end: DateTime.now().plus({ hours: 4 }).toJSDate()
    },
    {
      id: 6,
      content: 'Complexity VS OG',
      start: DateTime.now().minus({ hours: 4 }).toJSDate(),
      end: DateTime.now().minus({ hours: 2 }).toJSDate()
    },
    {
      id: 7,
      content: 'BIG VS Heroic',
      start: DateTime.now().minus({ hours: 3 }).toJSDate(),
      end: DateTime.now().minus({ hours: 1 }).toJSDate()
    },
    {
      id: 8,
      content: 'Evil Geniuses VS ENCE',
      start: DateTime.now().plus({ hours: 1 }).toJSDate(),
      end: DateTime.now().plus({ hours: 2 }).toJSDate()
    },
    {
      id: 9,
      content: 'FURIA VS Team Spirit',
      start: DateTime.now().minus({ hours: 1 }).toJSDate(),
      end: DateTime.now().plus({ hours: 1 }).toJSDate()
    },
    {
      id: 10,
      content: 'Astralis VS Team Liquid',
      start: DateTime.now().minus({ hours: 2 }).toJSDate(),
      end: DateTime.now().toJSDate()
    },
    {
      id: 11,
      content: 'Gambit VS FaZe Clan',
      start: DateTime.now().minus({ hours: 1 }).toJSDate(),
      end: DateTime.now().plus({ hours: 2 }).toJSDate()
    },
    {
      id: 12,
      content: 'mousesports VS Ninjas in Pyjamas',
      start: DateTime.now().minus({ hours: 3 }).toJSDate(),
      end: DateTime.now().minus({ hours: 1 }).toJSDate()
    },
    {
      id: 13,
      content: 'ENCE VS OG',
      start: DateTime.now().plus({ hours: 2 }).toJSDate(),
      end: DateTime.now().plus({ hours: 4 }).toJSDate()
    },
    {
      id: 14,
      content: 'Virtus.pro VS Heroic',
      start: DateTime.now().minus({ hours: 4 }).toJSDate(),
      end: DateTime.now().minus({ hours: 2 }).toJSDate()
    },
    {
      id: 15,
      content: 'Natus Vincere VS BIG',
      start: DateTime.now().plus({ hours: 1 }).toJSDate(),
      end: DateTime.now().plus({ hours: 3 }).toJSDate()
    }
  ];

  return (
    <Timeline items={items} />
  );
}
