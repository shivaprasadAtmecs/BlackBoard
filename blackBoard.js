const offset = 0;
const limit = 100;

async function blackBoardFullSync({ dataStore, client }) {
  console.log("Rates sync started");
  const responsedata1 = await client.fetch(`learn/api/public/v1/users`);
  // console.log(JSON.stringify(responsedata1));
  if (!responsedata1.ok) {
    throw new Error(
      `Accounts sync failed ${responsedata1.status}:${responsedata1.statusText}.`
    );
  }
  // console.log(JSON.stringify(responsedata1));
  const resdata1 = await responsedata1.json();
  console.log(JSON.stringify(resdata1.length))

  let j = 1;
  for (const resdatavalue1 of resdata1.results) {
    //  console.log(JSON.stringify (resdatavalue1));

    let nextPageExists;
    do {
      nextPageExists = false;
      const response1 = await client.fetch(
        `learn/api/public/v1/users?limit=${limit}&offset=${j * limit}`
      );
      j++;
      // console.log(JSON.stringify(limit));
      let result1 = await response1.json();
      //  console.log(JSON.stringify(result1));
      if (result1.ok) {
        throw new Error(
          `Courses sync failed ${result1.status}:${result1.statusText}.`
        );
      }
         console.log(j);
      result1.results.map((res) => {
        // console.log(JSON.stringify(res));
        let storedata = {
          id: res.id,
          email: res.contact.email,
          family: res.name.family,
          given: res.name.given,
          userName: res.userName,
        };
        // console.log(JSON.stringify(storedata));
        dataStore.save("users", storedata);
      });
    } while (nextPageExists);
  }
}

//   console.log(JSON.stringify(arry));

//Create Course Announcement
async function createCourseAnnouncement({
  dataStore,
  client,
  actionParameters,
}) {
  const response = await client.fetch(
    `learn/api/public/v1/courses/${actionParameters.courseId}/announcements`,
    {
      method: "POST",
      body: JSON.stringify({
        title: actionParameters.title,
        body: actionParameters.body,
        availability: {
          duration: {
            type: "Permanent",
            start: actionParameters.start,
            end: actionParameters.end,
          },
        },
      }),
    }
  );
  //  console.log(JSON.stringify(response));

  if (response.ok) {
    let updatedCourse = await response.json();
    // console.log(JSON.stringify(updatedCourse));
    // dataStore.save("Create Course Announcement", updatedCourse)
  } else {
    throw new Error(
      `Could not create course announcement (${response.status}: ${response.statusText})`
    );
  }
}

integration.define({
  synchronizations: [
    {
      name: "blackBoard",
      fullSyncFunction: blackBoardFullSync,
      incrementalSyncFunction: blackBoardFullSync,
    },
  ],
  actions: [
    {
      name: "Create Course Announcement",
      parameters: [
        {
          name: "title",
          type: "STRING",
          required: true,
        },
        {
          name: "message",
          type: "STRING",
        },
        {
          name: "type",
          type: "STRING",
        },
        {
          name: "start",
          type: "STRING",
        },
        {
          name: "end",
          type: "STRING",
        },
        {
          name: "courseId",
          type: "STRING",
          required: true,
        },
      ],
      function: createCourseAnnouncement,
    },
  ],

  model: {
    tables: [
      {
        name: "My coueses",
        columns: [
          {
            name: "Course_id",
            type: "STRING",
            length: 255,
            primaryKey: true,
          },

          {
            name: "name",
            type: "STRING",
            length: 255,
          },
          {
            name: "description",
            type: "STRING",
            length: 10000,
          },
        ],
      },
      {
        name: "users",
        columns: [
          {
            name: "id",
            type: "STRING",
            length: 255,
            primaryKey: true,
          },
          {
            name: "email",
            type: "STRING",
            length: 255,
          },
          {
            name: "family",
            type: "STRING",
            length: 255,
          },

          {
            name: "given",
            type: "STRING",
            length: 255,
          },
          {
            name: "userName",
            type: "STRING",
            length: 255,
          },
        ],
      },
    ],
  },
});
