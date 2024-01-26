import TotalsNumber from 'ui/TotalsNumber'

import { createCommitsTableTeamData } from './createCommitsTableTeamData'

import CIStatus from '../shared/CIStatus'
import Title from '../shared/Title'

describe('createCommitsTableTeamData', () => {
  describe('pages is undefined', () => {
    it('returns an empty array', () => {
      const result = createCommitsTableTeamData({})

      expect(result).toStrictEqual([])
    })
  })

  describe('pages is an empty array', () => {
    it('returns an empty array', () => {
      const result = createCommitsTableTeamData({ pages: [] })

      expect(result).toStrictEqual([])
    })
  })

  describe('commits in pages is empty', () => {
    it('returns an empty array', () => {
      const result = createCommitsTableTeamData({
        pages: [{ commits: [] }, { commits: [] }],
      })

      expect(result).toStrictEqual([])
    })
  })

  describe('pages has valid commits', () => {
    describe('compareWithParent __typename is not Comparison', () => {
      it('returns no report uploaded', () => {
        const commitData = {
          ciPassed: null,
          message: null,
          commitid: 'commit-123',
          createdAt: '2021-11-01T19:44:10.795533+00:00',
          author: null,
          compareWithParent: {
            __typename: 'MissingBaseCommit',
            message: 'Missing base commit',
          },
        } as const

        const result = createCommitsTableTeamData({
          pages: [{ commits: [commitData] }],
        })

        expect(result[0]?.patch).toStrictEqual(
          <p className="text-right">No report uploaded</p>
        )
      })
    })

    describe('compareWithParent __typename is Comparison', () => {
      it('returns with patch value', () => {
        const commitData = {
          ciPassed: null,
          message: null,
          commitid: 'commit-123',
          createdAt: '2021-11-01T19:44:10.795533+00:00',
          author: null,
          compareWithParent: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 100,
            },
          },
        } as const

        const result = createCommitsTableTeamData({
          pages: [{ commits: [commitData] }],
        })

        expect(result[0]?.patch).toStrictEqual(
          <div className="text-right">
            <TotalsNumber
              large={false}
              light={false}
              plain={true}
              showChange={false}
              value={100}
            />
          </div>
        )
      })

      describe('percent covered is null', () => {
        it('returns patch total of 0', () => {
          const commitData = {
            ciPassed: null,
            message: null,
            commitid: 'commit-123',
            createdAt: '2021-11-01T19:44:10.795533+00:00',
            author: null,
            compareWithParent: {
              __typename: 'Comparison',
              patchTotals: {
                percentCovered: null,
              },
            },
          } as const

          const result = createCommitsTableTeamData({
            pages: [{ commits: [commitData] }],
          })

          expect(result[0]?.patch).toStrictEqual(
            <div className="text-right">
              <TotalsNumber
                large={false}
                light={false}
                plain={true}
                showChange={false}
                value={0}
              />
            </div>
          )
        })
      })
    })

    describe('commit details are all non-null values', () => {
      it('returns the name component', () => {
        const commitData = {
          ciPassed: true,
          message: 'Cool commit message',
          commitid: 'commit123',
          createdAt: '2023-04-25T15:38:48.046832',
          author: {
            username: 'cool-user',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          },
          compareWithParent: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 100,
            },
          },
        } as const

        const result = createCommitsTableTeamData({
          pages: [{ commits: [commitData] }],
        })

        expect(result[0]?.name).toStrictEqual(
          <Title
            author={{
              avatarUrl: 'http://127.0.0.1/avatar-url',
              username: 'cool-user',
            }}
            commitid="commit123"
            createdAt="2023-04-25T15:38:48.046832"
            message="Cool commit message"
          />
        )
      })

      it('returns the ciStatus column', () => {
        const commitData = {
          ciPassed: true,
          message: 'Cool commit message',
          commitid: 'commit123',
          createdAt: '2023-04-25T15:38:48.046832',
          author: {
            username: 'cool-user',
            avatarUrl: 'http://127.0.0.1/avatar-url',
          },
          compareWithParent: {
            __typename: 'Comparison',
            patchTotals: {
              percentCovered: 100,
            },
          },
        } as const

        const result = createCommitsTableTeamData({
          pages: [{ commits: [commitData] }],
        })

        expect(result[0]?.ciStatus).toStrictEqual(
          <CIStatus ciPassed={true} commitid="commit123" coverage={100} />
        )
      })
    })
  })
})